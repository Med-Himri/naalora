import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB, isDemo } from "./db";
import { demoStore } from "./demo-store";
import { toCategoryDTO, toGuideDTO, toProductDTO } from "./mappers";
import { Category, Guide, Product } from "@/models";
import type { CategoryDTO, GuideDTO, ProductDTO } from "./types";

/** Cache tags — admin actions call revalidateTag() with these. */
export const TAGS = { catalog: "catalog", guides: "guides" } as const;

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
const getCatalog = isDemo ? loadCatalogFresh : unstable_cache(loadCatalogFresh, ["naalora-catalog"], { tags: [TAGS.catalog], revalidate: 3600 });
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

export function totalStock(p: ProductDTO): number {
  return p.sizes.reduce((sum, s) => sum + Math.max(0, s.stock), 0);
}

export function minPrice(products: ProductDTO[]): number | null {
  return products.length ? Math.min(...products.map((p) => p.price)) : null;
}
