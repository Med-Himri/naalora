import "server-only";
import { Types } from "mongoose";
import { connectDB, isDemo } from "../db";
import { demoStore } from "../demo-store";
import { toOrderDTO } from "../mappers";
import { isObjectId } from "../validation";
import { Category, Guide, Order, Product, Settings } from "@/models";
import type { ShippingSettings } from "../pricing";
import type { CategoryInput, GuideInput, ProductInput } from "./forms";
import type { L10n, OrderDTO, OrderStatus, ProductImageDTO } from "../types";

/**
 * Admin data operations. Every function works on MongoDB, or on the in-memory demo store
 * when MONGODB_URI is missing. Inputs are already validated (see forms.ts); ids are checked here.
 */

export class AdminError extends Error {}

const now = () => new Date().toISOString();
const demoId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function assertId(id: string) {
  if (!isDemo && !isObjectId(id)) throw new AdminError("Identifiant invalide.");
}

/* ===================== Orders ===================== */

export const ORDER_STATUS_VALUES: OrderStatus[] = ["nouveau", "confirme", "expedie", "livre", "annule"];

export async function listOrders(limit = 300): Promise<OrderDTO[]> {
  if (isDemo) return structuredClone(demoStore().orders.slice(0, limit));
  await connectDB();
  const docs = await Order.find().sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(toOrderDTO);
}

/** Changing to "annule" puts the items back in stock. A cancelled order cannot be reopened. */
export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  assertId(id);
  if (!ORDER_STATUS_VALUES.includes(status)) throw new AdminError("Statut invalide.");

  if (isDemo) {
    const s = demoStore();
    const o = s.orders.find((x) => x.id === id);
    if (!o) throw new AdminError("Commande introuvable.");
    if (o.status === "annule" && status !== "annule") throw new AdminError("Une commande annulée ne peut pas être rouverte. Créez une nouvelle commande.");
    if (status === "annule" && o.status !== "annule") {
      for (const it of o.items) {
        const row = s.products.find((p) => p.id === it.productId)?.sizes.find((x) => x.size === it.size);
        if (row) row.stock += it.qty;
      }
    }
    o.status = status;
    return;
  }

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) throw new AdminError("Commande introuvable.");
  if (order.status === "annule" && status !== "annule") throw new AdminError("Une commande annulée ne peut pas être rouverte. Créez une nouvelle commande.");
  if (status === "annule" && order.status !== "annule") {
    // Only the request that actually flips the status restocks (no double restock).
    const res = await Order.updateOne({ _id: id, status: { $ne: "annule" } }, { $set: { status } });
    if (res.modifiedCount === 1) {
      for (const it of order.items) {
        await Product.updateOne({ _id: it.product, "sizes.size": it.size }, { $inc: { "sizes.$.stock": it.qty } });
      }
    }
    return;
  }
  await Order.updateOne({ _id: id }, { $set: { status } });
}

/* ===================== Categories ===================== */

async function categoryExists(id: string): Promise<boolean> {
  if (isDemo) return demoStore().categories.some((c) => c.id === id);
  if (!isObjectId(id)) return false;
  await connectDB();
  return !!(await Category.exists({ _id: id }));
}

async function slugTaken(kind: "category" | "product" | "guide", slug: string, exceptId?: string): Promise<boolean> {
  if (isDemo) {
    const s = demoStore();
    const list = kind === "category" ? s.categories : kind === "product" ? s.products : s.guides;
    return list.some((x) => x.slug === slug && x.id !== exceptId);
  }
  await connectDB();
  const model = (kind === "category" ? Category : kind === "product" ? Product : Guide) as unknown as typeof Category;
  const filter: Record<string, unknown> = { slug };
  if (exceptId) filter._id = { $ne: new Types.ObjectId(exceptId) };
  return !!(await model.exists(filter));
}

export async function createCategory(data: CategoryInput): Promise<string> {
  if (await slugTaken("category", data.slug)) throw new AdminError("Ce slug est déjà utilisé.");
  if (isDemo) {
    const s = demoStore();
    const id = demoId("demo-cat");
    s.categories.push({ id, ...data, position: s.categories.length + 1, updatedAt: now() });
    return id;
  }
  await connectDB();
  const count = await Category.countDocuments();
  const doc = await Category.create({ ...data, position: count + 1 });
  return String(doc._id);
}

export async function updateCategory(id: string, data: CategoryInput): Promise<void> {
  assertId(id);
  if (await slugTaken("category", data.slug, id)) throw new AdminError("Ce slug est déjà utilisé.");
  if (isDemo) {
    const c = demoStore().categories.find((x) => x.id === id);
    if (!c) throw new AdminError("Catégorie introuvable.");
    Object.assign(c, data, { updatedAt: now() });
    return;
  }
  await connectDB();
  const res = await Category.updateOne({ _id: id }, { $set: { slug: data.slug, name: data.name, intro: data.intro } });
  if (res.matchedCount !== 1) throw new AdminError("Catégorie introuvable.");
}

/** Moves a category up (-1) or down (+1) and renumbers positions 1..n. */
export async function moveCategory(id: string, dir: -1 | 1): Promise<void> {
  assertId(id);
  if (isDemo) {
    const list = demoStore().categories.sort((a, b) => a.position - b.position);
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    list.forEach((c, k) => (c.position = k + 1));
    return;
  }
  await connectDB();
  const list = await Category.find().sort({ position: 1, createdAt: 1 }).select("_id").lean();
  const i = list.findIndex((c) => String(c._id) === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Category.bulkWrite(list.map((c, k) => ({ updateOne: { filter: { _id: c._id }, update: { $set: { position: k + 1 } } } })));
}

/* ===================== Products ===================== */

export async function saveProduct(id: string | null, data: ProductInput): Promise<string> {
  if (id) assertId(id);
  if (!(await categoryExists(data.categoryId))) throw new AdminError("Catégorie introuvable.");
  if (await slugTaken("product", data.slug, id ?? undefined)) throw new AdminError("Ce slug est déjà utilisé par un autre produit.");
  const { categoryId, ...rest } = data;

  if (isDemo) {
    const s = demoStore();
    if (id) {
      const p = s.products.find((x) => x.id === id);
      if (!p) throw new AdminError("Produit introuvable.");
      Object.assign(p, rest, { categoryId, updatedAt: now() });
      return id;
    }
    const newId = demoId("demo-prod");
    s.products.push({ id: newId, ...rest, categoryId, images: [], createdAt: now(), updatedAt: now() });
    return newId;
  }

  await connectDB();
  const doc = { ...rest, category: new Types.ObjectId(categoryId) };
  if (id) {
    const res = await Product.updateOne({ _id: id }, { $set: doc });
    if (res.matchedCount !== 1) throw new AdminError("Produit introuvable.");
    return id;
  }
  const created = await Product.create(doc);
  return String(created._id);
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  assertId(id);
  if (isDemo) {
    const p = demoStore().products.find((x) => x.id === id);
    if (!p) throw new AdminError("Produit introuvable.");
    p.active = active;
    return;
  }
  await connectDB();
  await Product.updateOne({ _id: id }, { $set: { active } });
}

export async function addProductImage(id: string, img: { url: string; publicId: string; alt: L10n }): Promise<void> {
  assertId(id);
  if (isDemo) {
    const p = demoStore().products.find((x) => x.id === id);
    if (!p) throw new AdminError("Produit introuvable.");
    if (p.images.length >= 12) throw new AdminError("12 images maximum.");
    p.images.push({ id: demoId("img"), ...img, position: p.images.length });
    return;
  }
  await connectDB();
  const p = await Product.findById(id).select("images").lean();
  if (!p) throw new AdminError("Produit introuvable.");
  if (p.images.length >= 12) throw new AdminError("12 images maximum.");
  await Product.updateOne({ _id: id }, { $push: { images: { ...img, position: p.images.length } } });
}

/** Removes the image and returns its Cloudinary publicId (to delete it there). */
export async function removeProductImage(id: string, imageId: string): Promise<string> {
  assertId(id);
  if (isDemo) {
    const p = demoStore().products.find((x) => x.id === id);
    const img = p?.images.find((i) => i.id === imageId);
    if (!p || !img) throw new AdminError("Image introuvable.");
    p.images = p.images.filter((i) => i.id !== imageId).map((i, k) => ({ ...i, position: k }));
    return img.publicId;
  }
  if (!isObjectId(imageId)) throw new AdminError("Image invalide.");
  await connectDB();
  const p = await Product.findById(id).select("images").lean();
  const img = p?.images.find((i) => String(i._id) === imageId);
  if (!p || !img) throw new AdminError("Image introuvable.");
  await Product.updateOne({ _id: id }, { $pull: { images: { _id: imageId } } });
  await renumberImages(id);
  return img.publicId ?? "";
}

async function renumberImages(id: string) {
  const p = await Product.findById(id).select("images").lean();
  if (!p) return;
  const sorted = [...p.images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  await Product.updateOne({ _id: id }, { $set: Object.fromEntries(sorted.map((img) => [`images.${p.images.indexOf(img)}.position`, sorted.indexOf(img)])) });
}

export async function moveProductImage(id: string, imageId: string, dir: -1 | 1): Promise<void> {
  assertId(id);
  const reorder = (imgs: ProductImageDTO[]) => {
    const list = [...imgs].sort((a, b) => a.position - b.position);
    const i = list.findIndex((x) => x.id === imageId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return null;
    [list[i], list[j]] = [list[j], list[i]];
    return list.map((x, k) => ({ id: x.id, position: k }));
  };
  if (isDemo) {
    const p = demoStore().products.find((x) => x.id === id);
    if (!p) throw new AdminError("Produit introuvable.");
    const order = reorder(p.images);
    if (order) p.images = order.map((o) => ({ ...p.images.find((x) => x.id === o.id)!, position: o.position })).sort((a, b) => a.position - b.position);
    return;
  }
  await connectDB();
  const p = await Product.findById(id).select("images").lean();
  if (!p) throw new AdminError("Produit introuvable.");
  const order = reorder(p.images.map((i) => ({ id: String(i._id), url: i.url, publicId: i.publicId ?? "", alt: { fr: "", ar: "" }, position: i.position ?? 0 })));
  if (!order) return;
  const set: Record<string, number> = {};
  p.images.forEach((img, idx) => (set[`images.${idx}.position`] = order.find((o) => o.id === String(img._id))!.position));
  await Product.updateOne({ _id: id }, { $set: set });
}

export async function setProductImageAlt(id: string, imageId: string, alt: L10n): Promise<void> {
  assertId(id);
  if (isDemo) {
    const img = demoStore().products.find((x) => x.id === id)?.images.find((i) => i.id === imageId);
    if (!img) throw new AdminError("Image introuvable.");
    img.alt = alt;
    return;
  }
  if (!isObjectId(imageId)) throw new AdminError("Image invalide.");
  await connectDB();
  const res = await Product.updateOne({ _id: id, "images._id": imageId }, { $set: { "images.$.alt": alt } });
  if (res.matchedCount !== 1) throw new AdminError("Image introuvable.");
}

/* ===================== Guides ===================== */

export async function saveGuide(id: string | null, data: GuideInput): Promise<string> {
  if (id) assertId(id);
  if (await slugTaken("guide", data.slug, id ?? undefined)) throw new AdminError("Ce slug est déjà utilisé par un autre guide.");
  const { coverAlt, ...rest } = data;

  if (isDemo) {
    const s = demoStore();
    if (id) {
      const g = s.guides.find((x) => x.id === id);
      if (!g) throw new AdminError("Guide introuvable.");
      Object.assign(g, rest, { cover: { ...g.cover, alt: coverAlt }, updatedAt: now() });
      return id;
    }
    const newId = demoId("demo-guide");
    s.guides.unshift({ id: newId, ...rest, cover: { url: "", publicId: "", alt: coverAlt }, createdAt: now(), updatedAt: now() });
    return newId;
  }
  await connectDB();
  if (id) {
    const res = await Guide.updateOne({ _id: id }, { $set: { ...rest, "cover.alt": coverAlt } });
    if (res.matchedCount !== 1) throw new AdminError("Guide introuvable.");
    return id;
  }
  const created = await Guide.create({ ...rest, cover: { url: "", publicId: "", alt: coverAlt } });
  return String(created._id);
}

export async function setGuidePublished(id: string, published: boolean): Promise<void> {
  assertId(id);
  if (isDemo) {
    const g = demoStore().guides.find((x) => x.id === id);
    if (!g) throw new AdminError("Guide introuvable.");
    g.published = published;
    g.updatedAt = now();
    return;
  }
  await connectDB();
  await Guide.updateOne({ _id: id }, { $set: { published } });
}

/** Sets (or clears) the cover; returns the previous publicId so it can be deleted from Cloudinary. */
export async function setGuideCover(id: string, cover: { url: string; publicId: string } | null): Promise<string> {
  assertId(id);
  const next = cover ?? { url: "", publicId: "" };
  if (isDemo) {
    const g = demoStore().guides.find((x) => x.id === id);
    if (!g) throw new AdminError("Guide introuvable.");
    const prev = g.cover.publicId;
    g.cover = { ...g.cover, ...next };
    return prev;
  }
  await connectDB();
  const g = await Guide.findById(id).select("cover").lean();
  if (!g) throw new AdminError("Guide introuvable.");
  await Guide.updateOne({ _id: id }, { $set: { "cover.url": next.url, "cover.publicId": next.publicId } });
  return g.cover?.publicId ?? "";
}

/* ===================== Delete product ===================== */

/** Deletes a product and returns its Cloudinary publicIds (to delete there too). Past orders keep their own copy. */
export async function deleteProduct(id: string): Promise<string[]> {
  assertId(id);
  if (isDemo) {
    const s = demoStore();
    const p = s.products.find((x) => x.id === id);
    if (!p) throw new AdminError("Produit introuvable.");
    s.products = s.products.filter((x) => x.id !== id);
    return p.images.map((i) => i.publicId).filter(Boolean);
  }
  await connectDB();
  const p = await Product.findById(id).select("images").lean();
  if (!p) throw new AdminError("Produit introuvable.");
  await Product.deleteOne({ _id: id });
  return (p.images ?? []).map((i) => i.publicId ?? "").filter(Boolean);
}

/* ===================== Store settings ===================== */

export async function saveShippingSettings(s: ShippingSettings): Promise<void> {
  if (isDemo) {
    demoStore().shipping = { ...s };
    return;
  }
  await connectDB();
  await Settings.updateOne({ key: "main" }, { $set: { shippingFee: s.fee, freeShippingFrom: s.freeFrom } }, { upsert: true });
}
