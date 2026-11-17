import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShopView, { parseShopParams } from "@/components/product/ShopView";
import { getActiveProducts, getCategories, getPublishedGuides } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/boutique">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const { hasParams } = parseShopParams(await searchParams);
  // Filtered / sorted URLs: noindex, canonical stays the clean URL.
  return pageMetadata({ lang, path: paths.shop, title: t.meta.shopTitle, description: t.meta.shopDescription, noindex: hasParams });
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[lang]/boutique">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { tone, sort } = parseShopParams(await searchParams);
  const [products, categories, guides] = await Promise.all([getActiveProducts(), getCategories(), getPublishedGuides()]);
  return (
    <ShopView
      lang={lang}
      title={t.shop.title}
      intro={t.shop.intro}
      basePath={paths.shop}
      allProducts={products}
      categories={categories}
      tone={tone}
      sort={sort}
      guides={guides}
    />
  );
}
