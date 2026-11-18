import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import TrustBadges from "@/components/ui/TrustBadges";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqList from "@/components/ui/FaqList";
import { ArrowIcon, SparkIcon } from "@/components/icons";
import { colorSiblings, getActiveProducts, getCategories, getPublishedGuides, minPrice } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { href, paths } from "@/lib/routes";
import { fmt, formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, organizationLd, websiteLd } from "@/lib/jsonld";


export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: "", title: t.meta.homeTitle, description: t.meta.homeDescription, absoluteTitle: true, og: `/og/home/${lang}` });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [products, categories, guides] = await Promise.all([getActiveProducts(), getCategories(), getPublishedGuides()]);

  const best = [...products.filter((p) => p.badge === "best"), ...products.filter((p) => p.badge !== "best")].slice(0, 4);
  const hero = best[0] ?? products[0];
  const from = minPrice(products);
  const swatches = hero ? colorSiblings(hero, products).slice(0, 8) : [];

  return (
    <>
      <JsonLd data={[organizationLd(lang), websiteLd(lang)]} />
      {/* Hero */}
      <section className="container-page pt-6 sm:pt-10" aria-labelledby="hero-title">
        <div className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-sand px-5 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:px-14">
          <div className="animate-fade-up">
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1 id="hero-title" className="mt-3 text-[2.4rem] leading-[1.08] sm:text-5xl lg:text-6xl">{t.home.title}</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/80">{t.home.text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={href(lang, paths.shop)} className="btn btn-primary">
                {t.home.ctaShop} <ArrowIcon width={18} height={18} className="rtl:rotate-180" />
              </Link>
              <Link href={href(lang, paths.sizeGuide)} className="btn btn-outline">{t.home.ctaGuide}</Link>
            </div>
            {swatches.length > 0 && (
              <div className="mt-8 flex items-center gap-3">
                <span className="text-sm text-muted">{t.home.colorsLabel}</span>
                <ul className="flex -space-x-1.5 rtl:space-x-reverse">
                  {swatches.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={href(lang, paths.product(p.slug))}
                        className="block h-7 w-7 rounded-full border-2 border-sand transition hover:-translate-y-0.5"
                        style={{ background: p.swatchHex }}
                        aria-label={fmt(t.a11y.colorLink, { name: p.colorName[lang] })}
                        title={p.colorName[lang]}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {hero?.images[0] && (
            <div className="relative">
              <Link href={href(lang, paths.product(hero.slug))} className="block">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[24px] shadow-lift">
                  <Image
                    src={hero.images[0].url}
                    alt={hero.images[0].alt[lang] || t.home.heroImageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </Link>
              {from !== null && (
                <p className="absolute bottom-5 start-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold shadow-lift sm:start-6">
                  {fmt(t.home.fromPrice, { price: formatPrice(from, lang) })}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-page mt-6" aria-label={t.home.featuresEyebrow}>
        <TrustBadges items={t.trust} />
      </section>

      {/* Categories */}
      <section className="container-page mt-20" aria-labelledby="cats-title">
        <SectionHeading id="cats-title" title={t.home.categoriesTitle} text={t.home.categoriesText} />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((c) => {
            const items = products.filter((p) => p.categoryId === c.id);
            const img = items[0]?.images[0];
            return (
              <li key={c.id}>
                <Link href={href(lang, paths.category(c.slug))} className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-brown shadow-soft">
                  {img && (
                    <Image src={img.url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-16 text-paper">
                    <span className="font-display block text-xl">{c.name[lang]}</span>
                    <span className="text-sm text-paper/85">{fmt(t.home.productsCount, { count: items.length })}</span>
                  </span>
                </Link>
              </li>
            );
          })}
          {t.home.upcoming.slice(0, Math.max(0, 4 - categories.length)).map((name) => (
            <li key={name} className="relative flex aspect-[4/5] flex-col justify-end rounded-[20px] border border-dashed border-line bg-paper/60 p-4">
              <span className="absolute start-4 top-4 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-brown">{t.home.soon}</span>
              <span className="font-display text-xl text-ink/70">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Best sellers */}
      {best.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="best-title">
          <SectionHeading id="best-title" title={t.home.bestTitle} text={t.home.bestText} link={{ href: href(lang, paths.shop), label: t.home.seeAll }} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Dark features section */}
      <section className="mt-24 bg-ink py-16 text-paper sm:py-20" aria-labelledby="features-title">
        <div className="container-page">
          <p className="eyebrow !text-[#e9a58a]">{t.home.featuresEyebrow}</p>
          <h2 id="features-title" className="mt-3 max-w-xl text-3xl sm:text-4xl">{t.home.featuresTitle}</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {t.home.features.map((f) => (
              <li key={f.title} className="rounded-[20px] border border-paper/10 bg-paper/5 p-6">
                <SparkIcon className="text-[#e9a58a]" />
                <h3 className="mt-4 text-xl">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-paper/75">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guides */}
      {guides.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="guides-title">
          <SectionHeading id="guides-title" title={t.home.guidesTitle} text={t.home.guidesText} link={{ href: href(lang, paths.guides), label: t.home.seeAll }} />
          <ul className="grid gap-4 md:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <li key={g.id}>
                <Link href={href(lang, paths.guide(g.slug))} className="group flex h-full flex-col rounded-[20px] bg-paper p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                  <h3 className="text-xl leading-snug">{g.title[lang]}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.excerpt[lang]}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {t.guides.readMore} <ArrowIcon width={16} height={16} className="transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      <section className="container-page mt-20" aria-labelledby="faq-title">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading id="faq-title" title={t.home.faqTitle} link={{ href: href(lang, paths.faq), label: t.home.faqMore }} />
          </div>
          <FaqList items={t.faq.items.slice(0, 5)} />
        </div>
      </section>
    </>
  );
}
