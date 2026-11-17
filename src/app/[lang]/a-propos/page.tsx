import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { MailIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { SITE, displayPhone, whatsappLink } from "@/lib/site";
import { href, paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbLd, organizationLd } from "@/lib/jsonld";


export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: paths.about, title: t.meta.aboutTitle, description: t.meta.aboutDescription, og: `/og/page/${lang}/about` });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="container-page pt-6 sm:pt-8">
      <JsonLd data={[organizationLd(lang), breadcrumbLd([{ name: t.breadcrumbHome, url: href(lang) }, { name: t.about.title, url: href(lang, paths.about) }])]} />
      <Breadcrumbs label={t.a11y.breadcrumb} items={[{ name: t.breadcrumbHome, href: href(lang) }, { name: t.about.title }]} />
      <div className="mx-auto mt-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{t.about.title}</h1>
        <p className="mt-5 text-xl leading-relaxed text-ink/85">{t.about.lead}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.about.sections.map((s) => (
            <section key={s.title} className="rounded-[20px] bg-paper p-6 shadow-soft">
              <h2 className="text-2xl">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-ink/80">{s.text}</p>
            </section>
          ))}
        </div>
        <section className="mt-10 rounded-[24px] bg-ink p-7 text-paper" aria-labelledby="contact-title">
          <h2 id="contact-title" className="text-3xl">{t.about.contactTitle}</h2>
          <p className="mt-2 text-paper/75">{t.about.contactText}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-sm text-paper/60"><WhatsAppIcon width={16} height={16} /> {t.about.whatsapp}</dt>
              <dd className="mt-1"><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" dir="ltr">{displayPhone()}</a></dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm text-paper/60"><MailIcon width={16} height={16} /> {t.about.email}</dt>
              <dd className="mt-1"><a href={`mailto:${SITE.email}`} className="font-semibold hover:underline">{SITE.email}</a></dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm text-paper/60"><PinIcon width={16} height={16} /> {t.about.city}</dt>
              <dd className="mt-1 font-semibold">{SITE.city[lang]}</dd>
            </div>
          </dl>
          <Link href={href(lang, paths.shop)} className="btn mt-7 bg-paper text-ink hover:bg-sand">{t.home.ctaShop}</Link>
        </section>
      </div>
    </div>
  );
}
