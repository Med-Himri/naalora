import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB, isDemo } from "./db";
import { demoStore } from "./demo-store";
import { toCategoryDTO, toGuideDTO, toProductDTO } from "./mappers";
import { Category, Guide, Product, Settings } from "@/models";
import { DEFAULT_SHIPPING, type ShippingSettings } from "./pricing";
import { minPriceOf, totalStock } from "./product";

export { totalStock };
import type { CategoryDTO, GuideDTO, HeroDTO, ProductDTO } from "./types";

/** Cache tags — admin actions call revalidateTag() with these. */
export const TAGS = { catalog: "catalog", guides: "guides", settings: "settings" } as const;

type Catalog = { categories: CategoryDTO[]; products: ProductDTO[] };

/** Uncached read of the whole catalog (small: a few dozen products). Used by admin & checkout. */
export async function loadCatalogFresh(): Promise<Catalog> {
  if (isDemo) {
    const s = demoStore();
    return { categories: structuredClone(s.categories), products: structuredClone(s.products) };
  }
  await connectDB();
  const [cats, prods] = await Promise.all([
    Category.find().sort({ position: 1, createdAt: 1 }).lean(),
    Product.find().sort({ position: 1, createdAt: 1 }).lean(),
  ]);
  return { categories: cats.map(toCategoryDTO), products: prods.map(toProductDTO) };
}

export async function loadGuidesFresh(): Promise<GuideDTO[]> {
  if (isDemo) return structuredClone(demoStore().guides);
  await connectDB();
  const docs = await Guide.find().sort({ updatedAt: -1 }).lean();
  return docs.map(toGuideDTO);
}

// Demo mode: no data cache (the in-memory store resets on restart, the Next cache would not).
/** Delivery settings (Admin → Réglages). Uncached: used by checkout and the admin. */
export async function loadShippingFresh(): Promise<ShippingSettings> {
  if (isDemo) return { ...demoStore().shipping };
  await connectDB();
  const doc = await Settings.findOne({ key: "main" }).lean();
  if (!doc) return { ...DEFAULT_SHIPPING };
  const fee = Number(doc.shippingFee) || 0;
  const freeFrom = doc.freeShippingFrom === null || doc.freeShippingFrom === undefined ? null : Number(doc.freeShippingFrom) || null;
  return { fee: Math.max(0, fee), freeFrom };
}

/** Home hero picture (Admin → Réglages). Uncached version for the admin. */
export async function loadHeroFresh(): Promise<HeroDTO> {
  if (isDemo) return structuredClone(demoStore().hero);
  await connectDB();
  const doc = await Settings.findOne({ key: "main" }).select("hero").lean();
  const h = doc?.hero;
  return { url: h?.url ?? "", publicId: h?.publicId ?? "", alt: { fr: h?.alt?.fr ?? "", ar: h?.alt?.ar ?? "" } };
}

export const getHero = isDemo ? loadHeroFresh : unstable_cache(loadHeroFresh, ["naalora-hero"], { tags: [TAGS.settings], revalidate: 3600 });

export const getShippingSettings = isDemo
  ? loadShippingFresh
  : unstable_cache(loadShippingFresh, ["naalora-shipping"], { tags: [TAGS.settings], revalidate: 3600 });

// Bump CATALOG_CACHE_VERSION whenever the product format changes, so old cached copies are ignored.
const CATALOG_CACHE_VERSION = "v2-colors";
const getCatalogCached = unstable_cache(loadCatalogFresh, [`naalora-catalog-${CATALOG_CACHE_VERSION}`], { tags: [TAGS.catalog], revalidate: 3600 });

/** Cached catalog, with a safety net: a cached copy in an old format is never used. */
async function getCatalog(): Promise<Catalog> {
  if (isDemo) return loadCatalogFresh();
  const cached = await getCatalogCached();
  return cached.products.every((p) => Array.isArray(p.colors) && p.colors.length > 0) ? cached : loadCatalogFresh();
}
const getGuidesCached = isDemo ? loadGuidesFresh : unstable_cache(loadGuidesFresh, ["naalora-guides"], { tags: [TAGS.guides], revalidate: 3600 });

/* ---------- Storefront reads (cached) ---------- */

export async function getCategories(): Promise<CategoryDTO[]> {
  const { categories, products } = await getCatalog();
  // Only categories that have at least one active product are shown publicly.
  return categories.filter((c) => products.some((p) => p.active && p.categoryId === c.id));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getActiveProducts(categoryId?: string): Promise<ProductDTO[]> {
  const { products } = await getCatalog();
  return products.filter((p) => p.active && (!categoryId || p.categoryId === categoryId));
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  return (await getActiveProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getCategoryById(id: string): Promise<CategoryDTO | null> {
  const { categories } = await getCatalog();
  return categories.find((c) => c.id === id) ?? null;
}

export async function getPublishedGuides(): Promise<GuideDTO[]> {
  return (await getGuidesCached()).filter((g) => g.published);
}

export async function getGuideBySlug(slug: string): Promise<GuideDTO | null> {
  return (await getPublishedGuides()).find((g) => g.slug === slug) ?? null;
}

/* ---------- Helpers ---------- */

export function minPrice(products: ProductDTO[]): number | null {
  return products.length ? Math.min(...products.map(minPriceOf)) : null;
}
