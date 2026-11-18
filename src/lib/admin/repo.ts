import "server-only";
import { Types } from "mongoose";
import { connectDB, isDemo } from "../db";
import { demoStore } from "../demo-store";
import { toOrderDTO, toProductDTO } from "../mappers";
import { isObjectId } from "../validation";
import { Category, Guide, Order, Product, Settings } from "@/models";
import type { ShippingSettings } from "../pricing";
import type { CategoryInput, GuideInput, ProductInput } from "./forms";
import type { ColorDTO, L10n, OrderDTO, OrderStatus, ProductImageDTO } from "../types";

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
        const prod = s.products.find((p) => p.id === it.productId);
        const color = prod?.colors.find((c) => c.key === it.color?.key) ?? prod?.colors[0];
        const row = color?.sizes.find((x) => x.size === it.size);
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
        const colorKey = it.color?.key;
        if (colorKey) {
          // Product with colours: put the pairs back in this colour + size.
          await Product.updateOne(
            { _id: it.product, "colors.key": colorKey },
            { $inc: { "colors.$[c].sizes.$[s].stock": it.qty } },
            { arrayFilters: [{ "c.key": colorKey }, { "s.size": it.size }] },
          );
        } else {
          // Order placed before colours existed.
          await Product.updateOne({ _id: it.product, "sizes.size": it.size }, { $inc: { "sizes.$.stock": it.qty } });
        }
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

const LEGACY_UNSET = { colorName: "", swatchHex: "", tone: "", images: "", sizes: "", model: "" };

/**
 * Old single-colour document → product with one colour (keeps its photos and stock).
 * Done once, the first time the product is edited.
 */
async function ensureColors(id: string): Promise<void> {
  const doc = await Product.findById(id).lean();
  if (!doc) throw new AdminError("Produit introuvable.");
  if (doc.colors && doc.colors.length) return;
  const c = toProductDTO(doc).colors[0];
  await Product.updateOne(
    { _id: id, $or: [{ colors: { $exists: false } }, { colors: { $size: 0 } }] },
    {
      $set: {
        colors: [
          {
            key: c.key,
            name: c.name,
            hex: c.hex,
            tone: c.tone,
            price: null,
            oldPrice: null,
            images: c.images.map((i) => ({ url: i.url, publicId: i.publicId, alt: i.alt, position: i.position })),
            sizes: c.sizes,
            position: 0,
          },
        ],
      },
      $unset: LEGACY_UNSET,
    },
  );
}

/** Saves the product; returns its id and the Cloudinary photos of removed colours (to delete there). */
export async function saveProduct(id: string | null, data: ProductInput): Promise<{ id: string; removedPublicIds: string[] }> {
  if (id) assertId(id);
  if (!(await categoryExists(data.categoryId))) throw new AdminError("Catégorie introuvable.");
  if (await slugTaken("product", data.slug, id ?? undefined)) throw new AdminError("Ce slug est déjà utilisé par un autre produit.");
  const { categoryId, colors, ...rest } = data;

  if (isDemo) {
    const s = demoStore();
    const existing = id ? s.products.find((x) => x.id === id) : null;
    if (id && !existing) throw new AdminError("Produit introuvable.");
    const nextColors: ColorDTO[] = colors.map((c, i) => {
      const prev = existing?.colors.find((x) => x.id === c.id);
      return { id: prev?.id ?? demoId("demo-color"), key: c.key, name: c.name, hex: c.hex, tone: c.tone, price: c.price, oldPrice: c.oldPrice, images: prev?.images ?? [], sizes: c.sizes, position: i };
    });
    const removed = (existing?.colors ?? []).filter((x) => !nextColors.some((c) => c.id === x.id)).flatMap((x) => x.images.map((i) => i.publicId)).filter(Boolean);
    if (existing) {
      Object.assign(existing, rest, { categoryId, colors: nextColors, updatedAt: now() });
      return { id: existing.id, removedPublicIds: removed };
    }
    const newId = demoId("demo-prod");
    s.products.push({ id: newId, ...rest, categoryId, colors: nextColors, createdAt: now(), updatedAt: now() });
    return { id: newId, removedPublicIds: [] };
  }

  await connectDB();
  let prevColors: ColorDTO[] = [];
  if (id) {
    await ensureColors(id);
    const doc = await Product.findById(id).lean();
    if (!doc) throw new AdminError("Produit introuvable.");
    prevColors = toProductDTO(doc).colors;
  }
  // Photos are managed separately (per colour): keep them from the database, never from the form.
  const nextColors = colors.map((c, i) => {
    const prev = prevColors.find((x) => x.id === c.id);
    return {
      ...(prev && isObjectId(prev.id) ? { _id: new Types.ObjectId(prev.id) } : {}),
      key: c.key,
      name: c.name,
      hex: c.hex,
      tone: c.tone,
      price: c.price,
      oldPrice: c.oldPrice,
      images: (prev?.images ?? []).map((img) => ({ ...(isObjectId(img.id) ? { _id: new Types.ObjectId(img.id) } : {}), url: img.url, publicId: img.publicId, alt: img.alt, position: img.position })),
      sizes: c.sizes,
      position: i,
    };
  });
  const removed = prevColors.filter((x) => !colors.some((c) => c.id === x.id)).flatMap((x) => x.images.map((i) => i.publicId)).filter(Boolean);
  const doc = { ...rest, category: new Types.ObjectId(categoryId), colors: nextColors };
  if (id) {
    const res = await Product.updateOne({ _id: id }, { $set: doc, $unset: LEGACY_UNSET });
    if (res.matchedCount !== 1) throw new AdminError("Produit introuvable.");
    return { id, removedPublicIds: removed };
  }
  const created = await Product.create(doc);
  return { id: String(created._id), removedPublicIds: [] };
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

/* ---------- Photos of one colour (targeted updates: never overwrite stock) ---------- */

const MAX_IMAGES_PER_COLOR = 12;

function demoColor(id: string, colorKey: string): ColorDTO {
  const c = demoStore().products.find((x) => x.id === id)?.colors.find((x) => x.key === colorKey);
  if (!c) throw new AdminError("Couleur introuvable. Enregistrez le produit d’abord.");
  return c;
}

async function dbColor(id: string, colorKey: string): Promise<ColorDTO> {
  await connectDB();
  await ensureColors(id);
  const doc = await Product.findById(id).lean();
  const c = doc ? toProductDTO(doc).colors.find((x) => x.key === colorKey) : null;
  if (!c) throw new AdminError("Couleur introuvable. Enregistrez le produit d’abord.");
  return c;
}

export async function addProductImage(id: string, colorKey: string, img: { url: string; publicId: string; alt: L10n }): Promise<void> {
  assertId(id);
  if (isDemo) {
    const c = demoColor(id, colorKey);
    if (c.images.length >= MAX_IMAGES_PER_COLOR) throw new AdminError(`${MAX_IMAGES_PER_COLOR} photos maximum par couleur.`);
    c.images.push({ id: demoId("img"), ...img, position: c.images.length });
    return;
  }
  const c = await dbColor(id, colorKey);
  if (c.images.length >= MAX_IMAGES_PER_COLOR) throw new AdminError(`${MAX_IMAGES_PER_COLOR} photos maximum par couleur.`);
  await Product.updateOne(
    { _id: id },
    { $push: { "colors.$[c].images": { ...img, position: c.images.length } } },
    { arrayFilters: [{ "c.key": colorKey }] },
  );
}

/** Removes the photo and returns its Cloudinary publicId (to delete it there). */
export async function removeProductImage(id: string, colorKey: string, imageId: string): Promise<string> {
  assertId(id);
  if (isDemo) {
    const c = demoColor(id, colorKey);
    const img = c.images.find((i) => i.id === imageId);
    if (!img) throw new AdminError("Photo introuvable.");
    c.images = c.images.filter((i) => i.id !== imageId).map((i, k) => ({ ...i, position: k }));
    return img.publicId;
  }
  if (!isObjectId(imageId)) throw new AdminError("Photo invalide.");
  const c = await dbColor(id, colorKey);
  const img = c.images.find((i) => i.id === imageId);
  if (!img) throw new AdminError("Photo introuvable.");
  await Product.updateOne({ _id: id }, { $pull: { "colors.$[c].images": { _id: new Types.ObjectId(imageId) } } }, { arrayFilters: [{ "c.key": colorKey }] });
  await setImageOrder(id, colorKey, c.images.filter((i) => i.id !== imageId).map((i) => i.id));
  return img.publicId;
}

/** Writes positions 0..n for the given photo order (one targeted update). */
async function setImageOrder(id: string, colorKey: string, orderedIds: string[]) {
  if (!orderedIds.length) return;
  const set: Record<string, number> = {};
  const filters: Record<string, unknown>[] = [{ "c.key": colorKey }];
  orderedIds.forEach((imgId, k) => {
    set[`colors.$[c].images.$[i${k}].position`] = k;
    filters.push({ [`i${k}._id`]: new Types.ObjectId(imgId) });
  });
  await Product.updateOne({ _id: id }, { $set: set }, { arrayFilters: filters });
}

export async function moveProductImage(id: string, colorKey: string, imageId: string, dir: -1 | 1): Promise<void> {
  assertId(id);
  const reorder = (imgs: ProductImageDTO[]) => {
    const list = [...imgs].sort((a, b) => a.position - b.position);
    const i = list.findIndex((x) => x.id === imageId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return null;
    [list[i], list[j]] = [list[j], list[i]];
    return list;
  };
  if (isDemo) {
    const c = demoColor(id, colorKey);
    const list = reorder(c.images);
    if (list) c.images = list.map((x, k) => ({ ...x, position: k }));
    return;
  }
  const c = await dbColor(id, colorKey);
  const list = reorder(c.images);
  if (list) await setImageOrder(id, colorKey, list.map((x) => x.id));
}

export async function setProductImageAlt(id: string, colorKey: string, imageId: string, alt: L10n): Promise<void> {
  assertId(id);
  if (isDemo) {
    const img = demoColor(id, colorKey).images.find((i) => i.id === imageId);
    if (!img) throw new AdminError("Photo introuvable.");
    img.alt = alt;
    return;
  }
  if (!isObjectId(imageId)) throw new AdminError("Photo invalide.");
  await dbColor(id, colorKey);
  const res = await Product.updateOne(
    { _id: id },
    { $set: { "colors.$[c].images.$[i].alt": alt } },
    { arrayFilters: [{ "c.key": colorKey }, { "i._id": new Types.ObjectId(imageId) }] },
  );
  if (res.matchedCount !== 1) throw new AdminError("Photo introuvable.");
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
    return p.colors.flatMap((c) => c.images.map((i) => i.publicId)).filter(Boolean);
  }
  await connectDB();
  const doc = await Product.findById(id).lean();
  if (!doc) throw new AdminError("Produit introuvable.");
  await Product.deleteOne({ _id: id });
  return toProductDTO(doc).colors.flatMap((c) => c.images.map((i) => i.publicId)).filter(Boolean);
}

/* ===================== Store settings ===================== */

/** Sets (or clears) the home hero picture; returns the previous Cloudinary publicId. */
export async function saveHeroImage(img: { url: string; publicId: string } | null): Promise<string> {
  const next = img ?? { url: "", publicId: "" };
  if (isDemo) {
    const s = demoStore();
    const prev = s.hero.publicId;
    s.hero = { ...s.hero, ...next };
    return prev;
  }
  await connectDB();
  const doc = await Settings.findOne({ key: "main" }).select("hero").lean();
  await Settings.updateOne({ key: "main" }, { $set: { "hero.url": next.url, "hero.publicId": next.publicId } }, { upsert: true });
  return doc?.hero?.publicId ?? "";
}

export async function saveHeroAlt(alt: L10n): Promise<void> {
  if (isDemo) {
    demoStore().hero.alt = alt;
    return;
  }
  await connectDB();
  await Settings.updateOne({ key: "main" }, { $set: { "hero.alt": alt } }, { upsert: true });
}

export async function saveShippingSettings(s: ShippingSettings): Promise<void> {
  if (isDemo) {
    demoStore().shipping = { ...s };
    return;
  }
  await connectDB();
  await Settings.updateOne({ key: "main" }, { $set: { shippingFee: s.fee, freeShippingFrom: s.freeFrom } }, { upsert: true });
}
