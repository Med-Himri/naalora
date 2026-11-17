import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { fmt } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { href, paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/guide-des-tailles">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: paths.sizeGuide, title: t.meta.sizeGuideTitle, description: t.meta.sizeGuideDescription });
}

export default async function SizeGuidePage({ params }: PageProps<"/[lang]/guide-des-tailles">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const cm = (v: number) => fmt(t.sizeGuide.cm, { cm: lang === "fr" ? String(v).replace(".", ",") : String(v) });
  return (
    <div className="container-page pt-6 sm:pt-8">
      <Breadcrumbs label={t.a11y.breadcrumb} items={[{ name: t.breadcrumbHome, href: href(lang) }, { name: t.guides.title, href: href(lang, paths.guides) }, { name: t.sizeGuide.title }]} />
      <div className="mx-auto mt-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{t.sizeGuide.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/80">{t.sizeGuide.intro}</p>

        <table className="mt-8 w-full overflow-hidden rounded-[20px] bg-paper text-start shadow-soft">
          <caption className="mb-3 text-start text-sm text-muted">{t.sizeGuide.tableCaption}</caption>
          <thead className="bg-ink text-paper">
            <tr>
              <th scope="col" className="px-5 py-3 text-start text-sm font-semibold">{t.sizeGuide.colSize}</th>
              <th scope="col" className="px-5 py-3 text-start text-sm font-semibold">{t.sizeGuide.colCm}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SITE.sizeChart.map((r) => (
              <tr key={r.size}>
                <th scope="row" className="px-5 py-3 text-start text-lg font-semibold tabular-nums">{r.size}</th>
                <td className="px-5 py-3 tabular-nums">{cm(r.cm)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-12" aria-labelledby="how-title">
          <h2 id="how-title" className="text-3xl">{t.sizeGuide.howTitle}</h2>
          <ol className="mt-5 space-y-3">
            {t.sizeGuide.steps.map((s, i) => (
              <li key={i} className="flex gap-4 rounded-[20px] bg-paper p-4 shadow-soft">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand font-semibold text-brown">{i + 1}</span>
                <span className="pt-1.5 leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 rounded-[20px] bg-sand p-6">
          <p className="font-semibold">{t.sizeGuide.tip}</p>
          <p className="mt-2 text-ink/80">{t.sizeGuide.exchange}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={href(lang, paths.shop)} className="btn btn-primary">{t.home.ctaShop}</Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
