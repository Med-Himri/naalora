import "server-only";
import type { CategoryDTO, ColorDTO, GuideDTO, L10n, OrderDTO, ProductDTO, ProductImageDTO, SizeDTO } from "./types";
import { slugKey } from "./product";

/* eslint-disable @typescript-eslint/no-explicit-any -- lean() documents are loosely typed */
const l10n = (v: any): L10n => ({ fr: v?.fr ?? "", ar: v?.ar ?? "" });
const iso = (d: any): string => (d ? new Date(d).toISOString() : new Date(0).toISOString());

export function toCategoryDTO(c: any): CategoryDTO {
  return {
    id: String(c._id),
    slug: c.slug,
    name: l10n(c.name),
    intro: l10n(c.intro),
    position: c.position ?? 0,
    updatedAt: iso(c.updatedAt),
  };
}

const toImages = (list: any[] | undefined): ProductImageDTO[] =>
  (list ?? [])
    .map((img: any) => ({ id: String(img._id ?? img.id), url: img.url, publicId: img.publicId ?? "", alt: l10n(img.alt), position: img.position ?? 0 }))
    .sort((a, b) => a.position - b.position);

const toSizes = (list: any[] | undefined): SizeDTO[] =>
  (list ?? []).map((s: any) => ({ size: Number(s.size), stock: Math.max(0, Number(s.stock) || 0) })).sort((a, b) => a.size - b.size);

const money = (v: any): number | null => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

export function toProductDTO(p: any): ProductDTO {
  let colors: ColorDTO[] = (p.colors ?? []).map((c: any, i: number) => ({
    id: String(c._id ?? c.id ?? `${p._id}-${i}`),
    key: c.key,
    name: l10n(c.name),
    hex: c.hex ?? "#cccccc",
    tone: c.tone ?? "other",
    price: money(c.price),
    oldPrice: money(c.oldPrice),
    images: toImages(c.images),
    sizes: toSizes(c.sizes),
    position: c.position ?? i,
  }));
  // Legacy document (one product per colour, before colours existed): expose it as a single colour.
  if (!colors.length) {
    const name = l10n(p.colorName);
    colors = [
      {
        id: `${p._id}-legacy`,
        key: slugKey(name.fr) || "unique",
        name: name.fr || name.ar ? name : { fr: "Unique", ar: "لون واحد" },
        hex: p.swatchHex ?? "#cccccc",
        tone: p.tone ?? "other",
        price: null,
        oldPrice: null,
        images: toImages(p.images),
        sizes: toSizes(p.sizes),
        position: 0,
      },
    ];
  }
  colors.sort((a, b) => a.position - b.position);
  return {
    id: String(p._id),
    slug: p.slug,
    sku: p.sku ?? "",
    categoryId: String(p.category),
    name: l10n(p.name),
    summary: l10n(p.summary),
    description: l10n(p.description),
    specs: {
      material: l10n(p.specs?.material),
      lining: l10n(p.specs?.lining),
      soleHeight: l10n(p.specs?.soleHeight),
      care: l10n(p.specs?.care),
    },
    price: p.price,
    oldPrice: money(p.oldPrice),
    badge: p.badge ?? "none",
    colors,
    active: !!p.active,
    position: p.position ?? 0,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  };
}

export function toGuideDTO(g: any): GuideDTO {
  return {
    id: String(g._id),
    slug: g.slug,
    title: l10n(g.title),
    excerpt: l10n(g.excerpt),
    content: l10n(g.content),
    cover: { url: g.cover?.url ?? "", publicId: g.cover?.publicId ?? "", alt: l10n(g.cover?.alt) },
    published: !!g.published,
    createdAt: iso(g.createdAt),
    updatedAt: iso(g.updatedAt),
  };
}

export function toOrderDTO(o: any): OrderDTO {
  return {
    id: String(o._id),
    ref: o.ref,
    status: o.status,
    locale: o.locale === "ar" ? "ar" : "fr",
    customer: {
      name: o.customer?.name ?? "",
      phone: o.customer?.phone ?? "",
      city: o.customer?.city ?? "",
      address: o.customer?.address ?? "",
      note: o.customer?.note ?? "",
    },
    items: (o.items ?? []).map((it: any) => ({
      productId: String(it.product),
      slug: it.slug,
      name: it.name,
      color: { key: it.color?.key ?? "", name: it.color?.name ?? "" },
      size: it.size,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    createdAt: iso(o.createdAt),
  };
}
