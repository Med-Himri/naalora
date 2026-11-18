import type { MetadataRoute } from "next";
import { getActiveProducts, getCategories, getPublishedGuides } from "@/lib/data";
import { SITE, absoluteUrl } from "@/lib/site";
import { hreflang, locales } from "@/lib/locales";
import { paths } from "@/lib/routes";

export const revalidate = 3600;

const latest = (...dates: (string | undefined)[]) =>
  new Date(Math.max(...dates.filter(Boolean).map((d) => new Date(d as string).getTime()), new Date(SITE.contentUpdatedAt).getTime()));

/** Every public page × both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, guides] = await Promise.all([getActiveProducts(), getCategories(), getPublishedGuides()]);
  const catalogDate = latest(...products.map((p) => p.updatedAt), ...categories.map((c) => c.updatedAt));
  const guidesDate = latest(...guides.map((g) => g.updatedAt));

  const pages: { path: string; lastModified: Date; priority: number; changeFrequency: "daily" | "weekly" | "monthly"; images?: string[] }[] = [
    { path: paths.home, lastModified: catalogDate, priority: 1, changeFrequency: "weekly" },
    { path: paths.shop, lastModified: catalogDate, priority: 0.9, changeFrequency: "daily" },
    ...categories.map((c) => ({
      path: paths.category(c.slug),
      lastModified: latest(c.updatedAt, ...products.filter((p) => p.categoryId === c.id).map((p) => p.updatedAt)),
      priority: 0.9,
      changeFrequency: "weekly" as const,
    })),
    ...products.map((p) => ({
      path: paths.product(p.slug),
      lastModified: new Date(p.updatedAt),
      priority: 0.8,
      changeFrequency: "weekly" as const,
      images: p.colors.flatMap((c) => c.images).map((i) => (i.url.startsWith("http") ? i.url : absoluteUrl(i.url))),
    })),
    { path: paths.guides, lastModified: guidesDate, priority: 0.6, changeFrequency: "weekly" },
    ...guides.map((g) => ({ path: paths.guide(g.slug), lastModified: new Date(g.updatedAt), priority: 0.6, changeFrequency: "monthly" as const })),
    { path: paths.sizeGuide, lastModified: new Date(SITE.contentUpdatedAt), priority: 0.6, changeFrequency: "monthly" },
    { path: paths.faq, lastModified: new Date(SITE.contentUpdatedAt), priority: 0.6, changeFrequency: "monthly" },
    { path: paths.about, lastModified: new Date(SITE.contentUpdatedAt), priority: 0.4, changeFrequency: "monthly" },
  ];

  return pages.flatMap((p) =>
    locales.map((lang) => ({
      url: absoluteUrl(`/${lang}${p.path}`),
      lastModified: p.lastModified,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
      alternates: {
        languages: {
          [hreflang.fr]: absoluteUrl(`/fr${p.path}`),
          [hreflang.ar]: absoluteUrl(`/ar${p.path}`),
          "x-default": absoluteUrl(`/fr${p.path}`),
        },
      },
      ...(p.images?.length ? { images: p.images } : {}),
    })),
  );
}
