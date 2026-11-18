import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FaqList from "@/components/ui/FaqList";
import TrustBadges from "@/components/ui/TrustBadges";
import ProductCard from "@/components/product/ProductCard";
import ProductView from "@/components/product/ProductView";
import { PlusIcon } from "@/components/icons";
import { getActiveProducts, getCategoryById, getProductBySlug, getShippingSettings } from "@/lib/data";
import { allSizes, coverImage, defaultColor, minPriceOf, priceOf } from "@/lib/product";
import { getDictionaryLive } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/locales";
import { formatPrice } from "@/lib/format";
import { href, paths } from "@/lib/routes";
import { pageMetadata, shareImageFrom } from "@/lib/seo";
import { JsonLd, breadcrumbLd, faqLd, productLd } from "@/lib/jsonld";


export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/produit/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const img = coverImage(p);
  return pageMetadata({
    lang,
    path: paths.product(p.slug),
    title: `${p.name[lang]} — ${formatPrice(minPriceOf(p), lang)}`,
    description: p.summary[lang],
    images: shareImageFrom(img?.url) ? [{ url: shareImageFrom(img?.url)!, width: 1200, height: 630, alt: img!.alt[lang] || p.name[lang] }] : undefined,
    og: `/og/product/${lang}/${p.slug}`,
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/produit/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const t = await getDictionaryLive(lang);
  const [category, all, shipping] = await Promise.all([getCategoryById(product.categoryId), getActiveProducts(), getShippingSettings()]);
  // "You may also like": other products of the same category first, then the rest.
  const others = all.filter((p) => p.id !== product.id);
  const related = [...others.filter((p) => p.categoryId === product.categoryId), ...others.filter((p) => p.categoryId !== product.categoryId)].slice(0, 3);

  const first = defaultColor(product);
  const sizes = allSizes(product);
  const sizeRange = sizes.length ? `${sizes[0]}–${sizes[sizes.length - 1]} (EU)` : "—";
  const prices = [...new Set(product.colors.map((c) => priceOf(product, c)))].sort((a, b) => a - b);
  const badge = product.badge === "best" ? t.product.badgeBest : product.badge === "new" ? t.product.badgeNew : null;

  const specs: [string, string][] = [
    [t.product.specs.material, product.specs.material[lang]],
    [t.product.specs.lining, product.specs.lining[lang]],
    [t.product.specs.sole, product.specs.soleHeight[lang]],
    [t.product.specs.sizes, sizeRange],
    [t.product.specs.colors, product.colors.map((c) => c.name[lang]).join(", ")],
    [t.product.specs.care, product.specs.care[lang]],
    [t.product.specs.delivery, t.product.deliveryValue],
    [t.product.specs.price, prices.length > 1 ? prices.map((x) => formatPrice(x, lang)).join(" / ") : formatPrice(prices[0], lang)],
    [t.product.specs.sku, product.sku],
  ].filter(([, v]) => !!v) as [string, string][];

  const crumbs = [
    { name: t.breadcrumbHome, href: href(lang) },
    { name: t.shop.title, href: href(lang, paths.shop) },
    ...(category ? [{ name: category.name[lang], href: href(lang, paths.category(category.slug)) }] : []),
    { name: product.name[lang], href: href(lang, paths.product(product.slug)) },
  ];

  return (
    <div className="container-page pt-6 sm:pt-8">
      <JsonLd
        data={[
          productLd(product, lang, category, shipping),
          breadcrumbLd(crumbs.map((c) => ({ name: c.name, url: c.href }))),
          faqLd(t.product.faq),
        ]}
      />
      <Breadcrumbs label={t.a11y.breadcrumb} items={crumbs} />

      <ProductView
        lang={lang}
        product={product}
        initialKey={first.key}
        sizeGuideHref={href(lang, paths.sizeGuide)}
        t={{
          color: t.product.color,
          inStock: t.product.inStock,
          lowStock: t.product.lowStock,
          outOfStock: t.product.outOfStock,
          save: t.product.save,
          thumbnail: t.a11y.thumbnail,
          colorSoldOut: t.product.colorSoldOut,
          size: t.product.size,
          soldOut: t.product.soldOut,
          sizeGuide: t.product.sizeGuide,
          quantity: t.product.quantity,
          addToCart: t.product.addToCart,
          added: t.product.added,
          orderNow: t.product.orderNow,
          chooseSize: t.product.chooseSize,
          increase: t.a11y.increase,
          decrease: t.a11y.decrease,
        }}
        header={
          <>
            {badge && <p className="eyebrow">{badge}</p>}
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{product.name[lang]}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink/85">{product.summary[lang]}</p>
          </>
        }
        footer={
          <>
            <div className="mt-8">
              <TrustBadges items={t.trust} compact />
            </div>
            <div className="mt-8 divide-y divide-line overflow-hidden rounded-[20px] bg-paper shadow-soft">
              {[
                { title: t.product.deliveryTitle, text: t.product.deliveryText },
                { title: t.product.exchangeTitle, text: t.product.exchangeText },
              ].map((a) => (
                <details key={a.title} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold">
                    {a.title}
                    <PlusIcon width={18} height={18} className="transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted">{a.text}</p>
                </details>
              ))}
            </div>
          </>
        }
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="desc-title">
          <h2 id="desc-title" className="text-3xl">{product.name[lang]}</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/85">
            {product.description[lang].split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </section>
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-3xl">{t.product.specsTitle}</h2>
          <table className="mt-4 w-full overflow-hidden rounded-[20px] bg-paper text-sm shadow-soft">
            <tbody className="divide-y divide-line">
              {specs.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-2/5 bg-sand/40 px-4 py-3 text-start font-semibold">{k}</th>
                  <td className="px-4 py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="mt-16" aria-labelledby="pfaq-title">
        <h2 id="pfaq-title" className="mb-5 text-3xl">{t.product.faqTitle}</h2>
        <FaqList items={t.product.faq} />
      </section>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-6 text-3xl">{t.product.alsoLike}</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
