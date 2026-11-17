import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { getPublishedGuides } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { fmt, formatDate } from "@/lib/format";
import { href, paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/guides">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: paths.guides, title: t.meta.guidesTitle, description: t.meta.guidesDescription });
}

export default async function GuidesPage({ params }: PageProps<"/[lang]/guides">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const guides = await getPublishedGuides();
  return (
    <div className="container-page pt-6 sm:pt-8">
      <Breadcrumbs label={t.a11y.breadcrumb} items={[{ name: t.breadcrumbHome, href: href(lang) }, { name: t.guides.title }]} />
      <header className="mt-5 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{t.guides.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink/80">{t.guides.intro}</p>
      </header>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link href={href(lang, paths.sizeGuide)} className="group flex h-full flex-col rounded-[20px] bg-ink p-6 text-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <h2 className="text-2xl">{t.sizeGuide.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-paper/75">{t.sizeGuide.intro}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">{t.guides.readMore} <ArrowIcon width={16} height={16} className="rtl:rotate-180" /></span>
          </Link>
        </li>
        {guides.map((g) => (
          <li key={g.id}>
            <Link href={href(lang, paths.guide(g.slug))} className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              {g.cover.url && (
                <div className="relative aspect-[16/9] bg-sand">
                  <Image src={g.cover.url} alt={g.cover.alt[lang] || ""} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-2xl leading-snug">{g.title[lang]}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.excerpt[lang]}</p>
                <p className="mt-4 text-xs text-muted">{fmt(t.guides.updated, { date: formatDate(g.updatedAt, lang) })}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">{t.guides.readMore} <ArrowIcon width={16} height={16} className="rtl:rotate-180" /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {guides.length === 0 && <p className="mt-6 text-muted">{t.guides.empty}</p>}
    </div>
  );
}
