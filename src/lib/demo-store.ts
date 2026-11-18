import "server-only";
import { seedCategories, seedGuides, seedProducts } from "./seed-data";
import { applyTestCatalog, testCatalogEnabled, testPhotosDir, testPhotosFound } from "./test-catalog";
import type { CategoryDTO, GuideDTO, OrderDTO, ProductDTO } from "./types";
import { DEFAULT_SHIPPING, type ShippingSettings } from "./pricing";

/**
 * In-memory data for demo mode (no MONGODB_URI). Resets on every server restart.
 * Guides are shown as published here so every page can be previewed locally.
 */
type Store = { categories: CategoryDTO[]; products: ProductDTO[]; guides: GuideDTO[]; orders: OrderDTO[]; shipping: ShippingSettings };

const g = globalThis as unknown as { __naaloraDemo?: Store };

function build(): Store {
  const now = new Date("2026-11-17T09:00:00Z").toISOString();
  const categories: CategoryDTO[] = seedCategories.map((c, i) => ({
    id: `demo-cat-${i + 1}`,
    slug: c.slug,
    name: c.name,
    intro: c.intro,
    position: c.position,
    updatedAt: now,
  }));
  const products: ProductDTO[] = seedProducts.map((p, i) => ({
    id: `demo-prod-${i + 1}`,
    slug: p.slug,
    sku: p.sku,
    categoryId: categories.find((c) => c.slug === p.categorySlug)!.id,
    model: p.model,
    name: p.name,
    summary: p.summary,
    description: p.description,
    specs: p.specs,
    colorName: p.colorName,
    swatchHex: p.swatchHex,
    tone: p.tone,
    price: p.price,
    oldPrice: p.oldPrice,
    badge: p.badge,
    images: p.images.map((img, j) => ({ ...img, id: `demo-img-${i + 1}-${j + 1}` })),
    sizes: p.sizes.map((s) => ({ ...s })),
    active: p.active,
    position: p.position,
    createdAt: now,
    updatedAt: now,
  }));
  const guides: GuideDTO[] = seedGuides.map((gd, i) => ({
    id: `demo-guide-${i + 1}`,
    slug: gd.slug,
    title: gd.title,
    excerpt: gd.excerpt,
    content: gd.content,
    cover: { url: "", publicId: "", alt: { fr: "", ar: "" } },
    published: true,
    createdAt: now,
    updatedAt: now,
  }));
  const store = { categories, products, guides, orders: [] as OrderDTO[], shipping: { ...DEFAULT_SHIPPING } };
  if (testCatalogEnabled) applyTestCatalog(store);
  // One line in the terminal so it is clear which data the site shows.
  console.info(
    `[naalora] Mode démo (pas de MONGODB_URI) — catalogue de test : ${
      testCatalogEnabled ? "ACTIVÉ (photos de public/test-photos)" : testPhotosFound ? "désactivé (NAALORA_TEST_CATALOG=0)" : `désactivé : aucune photo trouvée dans ${testPhotosDir}`
    }`,
  );
  return store;
}

export function demoStore(): Store {
  return g.__naaloraDemo ?? (g.__naaloraDemo = build());
}
