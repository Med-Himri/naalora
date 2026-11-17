import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShopView, { parseShopParams } from "@/components/product/ShopView";
import { getActiveProducts, getCategories, getCategoryBySlug, getPublishedGuides } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { fmt } from "@/lib/format";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/boutique/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang)) return {};
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  const t = getDictionary(lang);
  const { hasParams } = parseShopParams(await searchParams);
  return pageMetadata({
    lang,
    path: paths.category(cat.slug),
    title: fmt(t.meta.categoryTitle, { name: cat.name[lang] }),
    description: cat.intro[lang] || t.meta.shopDescription,
    noindex: hasParams,
    og: `/og/category/${lang}/${cat.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/boutique/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();
  const { tone, sort } = parseShopParams(await searchParams);
  const [products, categories, guides] = await Promise.all([getActiveProducts(cat.id), getCategories(), getPublishedGuides()]);
  return (
    <ShopView
      lang={lang}
      title={cat.name[lang]}
      intro={cat.intro[lang]}
      basePath={paths.category(cat.slug)}
      allProducts={products}
      categories={categories}
      activeCategory={cat}
      tone={tone}
      sort={sort}
      guides={guides}
    />
  );
}
