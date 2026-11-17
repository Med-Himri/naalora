import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FaqList from "@/components/ui/FaqList";
import { WhatsAppIcon } from "@/components/icons";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { fmt, formatDate } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { href, paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/jsonld";


export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: paths.faq, title: t.meta.faqTitle, description: t.meta.faqDescription, og: `/og/page/${lang}/faq` });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="container-page pt-6 sm:pt-8">
      <JsonLd data={[faqLd(t.faq.items), breadcrumbLd([{ name: t.breadcrumbHome, url: href(lang) }, { name: t.faq.title, url: href(lang, paths.faq) }])]} />
      <Breadcrumbs label={t.a11y.breadcrumb} items={[{ name: t.breadcrumbHome, href: href(lang) }, { name: t.faq.title }]} />
      <div className="mx-auto mt-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{t.faq.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/80">{t.faq.intro}</p>
        <p className="mt-3 text-sm text-muted">
          <time dateTime={SITE.contentUpdatedAt}>{fmt(t.faq.updated, { date: formatDate(SITE.contentUpdatedAt, lang) })}</time>
        </p>
        <div className="mt-8">
          <FaqList items={t.faq.items} headingLevel="h2" />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-sand p-6">
          <div>
            <p className="font-display text-xl">{t.faq.more}</p>
            <p className="mt-1 text-ink/80">{t.faq.moreText}</p>
          </div>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><WhatsAppIcon width={18} height={18} /> WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
