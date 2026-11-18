import "server-only";
import type { CategoryDTO, GuideDTO, L10n, OrderDTO, ProductDTO } from "./types";

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

export function toProductDTO(p: any): ProductDTO {
  return {
    id: String(p._id),
    slug: p.slug,
    sku: p.sku ?? "",
    categoryId: String(p.category),
    model: p.model ?? "",
    name: l10n(p.name),
    summary: l10n(p.summary),
    description: l10n(p.description),
    specs: {
      material: l10n(p.specs?.material),
      lining: l10n(p.specs?.lining),
      soleHeight: l10n(p.specs?.soleHeight),
      care: l10n(p.specs?.care),
    },
    colorName: l10n(p.colorName),
    swatchHex: p.swatchHex ?? "#cccccc",
    tone: p.tone ?? "other",
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    badge: p.badge ?? "none",
    images: (p.images ?? [])
      .map((img: any) => ({
        id: String(img._id),
        url: img.url,
        publicId: img.publicId ?? "",
        alt: l10n(img.alt),
        position: img.position ?? 0,
      }))
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position),
    sizes: (p.sizes ?? [])
      .map((s: any) => ({ size: s.size, stock: s.stock }))
      .sort((a: { size: number }, b: { size: number }) => a.size - b.size),
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
