import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FaqList from "@/components/ui/FaqList";
import TrustBadges from "@/components/ui/TrustBadges";
import Gallery from "@/components/product/Gallery";
import Price from "@/components/product/Price";
import ProductCard from "@/components/product/ProductCard";
import ProductPurchase from "@/components/product/ProductPurchase";
import { PlusIcon } from "@/components/icons";
import { colorSiblings, getActiveProducts, getCategoryById, getProductBySlug, totalStock } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/locales";
import { fmt, formatPrice } from "@/lib/format";
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
  const img = p.images[0];
  return pageMetadata({
    lang,
    path: paths.product(p.slug),
    title: `${p.name[lang]} — ${formatPrice(p.price, lang)}`,
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
  const t = getDictionary(lang);
  const [category, all] = await Promise.all([getCategoryById(product.categoryId), getActiveProducts()]);
  const siblings = colorSiblings(product, all);
  // "You may also like": other models of the same category first, then other categories, then other colours.
  const others = all.filter((p) => !siblings.includes(p));
  const related = [
    ...others.filter((p) => p.categoryId === product.categoryId),
    ...others.filter((p) => p.categoryId !== product.categoryId),
    ...siblings.filter((p) => p.id !== product.id),
  ].slice(0, 3);

  const stock = totalStock(product);
  const stockLine = stock <= 0 ? t.product.outOfStock : stock <= 5 ? fmt(t.product.lowStock, { count: stock }) : t.product.inStock;
  const sizes = product.sizes.map((s) => s.size);
  const sizeRange = sizes.length ? `${Math.min(...sizes)}–${Math.max(...sizes)} (EU)` : "—";
  const badge = product.badge === "best" ? t.product.badgeBest : product.badge === "new" ? t.product.badgeNew : null;

  const specs: [string, string][] = [
    [t.product.specs.material, product.specs.material[lang]],
    [t.product.specs.lining, product.specs.lining[lang]],
    [t.product.specs.sole, product.specs.soleHeight[lang]],
    [t.product.specs.sizes, sizeRange],
    [t.product.specs.colors, siblings.map((p) => p.colorName[lang]).join(", ")],
    [t.product.specs.care, product.specs.care[lang]],
    [t.product.specs.delivery, t.product.deliveryValue],
    [t.product.specs.price, formatPrice(product.price, lang)],
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
          productLd(product, lang, category),
          breadcrumbLd(crumbs.map((c) => ({ name: c.name, url: c.href }))),
          faqLd(t.product.faq),
        ]}
      />
      <Breadcrumbs label={t.a11y.breadcrumb} items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Gallery
            images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt[lang] || product.name[lang] }))}
            thumbLabel={t.a11y.thumbnail}
          />
        </div>

        <div>
          {badge && <p className="eyebrow">{badge}</p>}
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{product.name[lang]}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/85">{product.summary[lang]}</p>

          <div className="mt-6">
            <Price price={product.price} oldPrice={product.oldPrice} lang={lang} saveLabel={t.product.save} size="lg" />
            <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${stock <= 0 ? "text-muted" : "text-[#17834a]"}`}>
              <span className={`h-2 w-2 rounded-full ${stock <= 0 ? "bg-muted" : "bg-whatsapp"}`} aria-hidden="true" />
              {stockLine}
            </p>
          </div>

          {siblings.length > 1 && (
            <div className="mt-6">
              <p className="text-sm font-semibold">
                {t.product.color} : <span className="font-normal text-muted">{product.colorName[lang]}</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {siblings.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={href(lang, paths.product(p.slug))}
                      aria-label={fmt(t.a11y.colorLink, { name: p.colorName[lang] })}
                      aria-current={p.id === product.id ? "page" : undefined}
                      title={p.colorName[lang]}
                      className={`block h-10 w-10 rounded-full ring-offset-2 ring-offset-cream transition ${p.id === product.id ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-ink/50"}`}
                      style={{ background: p.swatchHex }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7">
            <ProductPurchase
              lang={lang}
              sizeGuideHref={href(lang, paths.sizeGuide)}
              product={{
                id: product.id,
                slug: product.slug,
                price: product.price,
                name: product.name,
                color: product.colorName,
                image: product.images[0]?.url ?? "",
                sizes: product.sizes,
              }}
              t={{
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
            />
          </div>

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
        </div>
      </div>

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
