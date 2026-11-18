import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getCategories, getGuideBySlug, getPublishedGuides } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/locales";
import { fmt, formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { href, paths } from "@/lib/routes";
import { pageMetadata, shareImageFrom } from "@/lib/seo";
import { JsonLd, articleLd, breadcrumbLd } from "@/lib/jsonld";


export const revalidate = 3600;

export async function generateStaticParams() {
  const guides = await getPublishedGuides();
  return locales.flatMap((lang) => guides.map((g) => ({ lang, slug: g.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/guides/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const g = await getGuideBySlug(slug);
  if (!g) return {};
  return pageMetadata({
    lang,
    path: paths.guide(g.slug),
    title: g.title[lang],
    description: g.excerpt[lang],
    type: "article",
    images: shareImageFrom(g.cover.url) ? [{ url: shareImageFrom(g.cover.url)!, width: 1200, height: 630, alt: g.cover.alt[lang] }] : undefined,
    og: `/og/guide/${lang}/${g.slug}`,
  });
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guides/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();
  const t = getDictionary(lang);
  const [all, categories] = await Promise.all([getPublishedGuides(), getCategories()]);
  const others = all.filter((g) => g.id !== guide.id).slice(0, 3);
  const html = renderMarkdown(guide.content[lang]);

  return (
    <div className="container-page pt-6 sm:pt-8">
      <JsonLd
        data={[
          articleLd(guide, lang, t.guides.author),
          breadcrumbLd([
            { name: t.breadcrumbHome, url: href(lang) },
            { name: t.guides.title, url: href(lang, paths.guides) },
            { name: guide.title[lang], url: href(lang, paths.guide(guide.slug)) },
          ]),
        ]}
      />
      <Breadcrumbs
        label={t.a11y.breadcrumb}
        items={[{ name: t.breadcrumbHome, href: href(lang) }, { name: t.guides.title, href: href(lang, paths.guides) }, { name: guide.title[lang] }]}
      />
      <article className="mx-auto mt-8 max-w-3xl">
        <header>
          <h1 className="text-4xl leading-tight sm:text-5xl">{guide.title[lang]}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/80">{guide.excerpt[lang]}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{t.guides.by} <span className="font-semibold text-ink">{t.guides.author}</span></span>
            <span aria-hidden="true">·</span>
            <time dateTime={guide.updatedAt}>{fmt(t.guides.updated, { date: formatDate(guide.updatedAt, lang) })}</time>
          </p>
        </header>
        {guide.cover.url && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[24px] bg-sand">
            <Image src={guide.cover.url} alt={guide.cover.alt[lang] || ""} fill preload sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="prose-naalora mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        <aside className="mt-12 rounded-[20px] bg-sand p-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={href(lang, paths.category(c.slug))} className="btn btn-primary">{c.name[lang]}</Link>
            ))}
            <Link href={href(lang, paths.sizeGuide)} className="btn btn-outline">{t.nav.sizeGuide}</Link>
          </div>
        </aside>
      </article>

      {others.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="more-guides">
          <h2 id="more-guides" className="text-2xl">{t.guides.related}</h2>
          <ul className="mt-4 space-y-3">
            {others.map((g) => (
              <li key={g.id}>
                <Link href={href(lang, paths.guide(g.slug))} className="block rounded-[20px] bg-paper p-5 shadow-soft transition hover:shadow-lift">
                  <span className="font-display block text-lg">{g.title[lang]}</span>
                  <span className="mt-1 block text-sm text-muted">{g.excerpt[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
