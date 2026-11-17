import Link from "next/link";
import ProductCard from "./ProductCard";
import Breadcrumbs from "../ui/Breadcrumbs";
import { getDictionary } from "@/lib/i18n";
import { fmt } from "@/lib/format";
import { href, paths } from "@/lib/routes";
import type { Locale } from "@/lib/locales";
import type { CategoryDTO, GuideDTO, ProductDTO, Tone } from "@/lib/types";

export const SORTS = ["popular", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];
const TONES: Tone[] = ["brown", "pastel", "dark", "other"];

/** Only whitelisted values are used — anything else falls back to the default. */
export function parseShopParams(sp: Record<string, string | string[] | undefined>) {
  const tone = typeof sp.tone === "string" && (TONES as string[]).includes(sp.tone) ? (sp.tone as Tone) : null;
  const sort: Sort = typeof sp.sort === "string" && (SORTS as readonly string[]).includes(sp.sort) ? (sp.sort as Sort) : "popular";
  const hasParams = Object.keys(sp).length > 0;
  return { tone, sort, hasParams };
}

export function applyShopParams(products: ProductDTO[], tone: Tone | null, sort: Sort): ProductDTO[] {
  const list = tone ? products.filter((p) => p.tone === tone) : [...products];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price || a.position - b.position);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price || a.position - b.position);
  return list;
}

type Props = {
  lang: Locale;
  title: string;
  intro: string;
  basePath: string;
  allProducts: ProductDTO[];
  categories: CategoryDTO[];
  activeCategory?: CategoryDTO;
  tone: Tone | null;
  sort: Sort;
  guides: GuideDTO[];
};

export default function ShopView({ lang, title, intro, basePath, allProducts, categories, activeCategory, tone, sort, guides }: Props) {
  const t = getDictionary(lang);
  const products = applyShopParams(allProducts, tone, sort);
  const availableTones = TONES.filter((x) => allProducts.some((p) => p.tone === x));
  const qs = (next: { tone?: Tone | null; sort?: Sort }) => {
    const p = new URLSearchParams();
    const nt = next.tone === undefined ? tone : next.tone;
    const ns = next.sort ?? sort;
    if (nt) p.set("tone", nt);
    if (ns !== "popular") p.set("sort", ns);
    const s = p.toString();
    return `${href(lang, basePath)}${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium transition ${active ? "bg-ink text-paper" : "bg-paper text-ink shadow-soft hover:bg-sand"}`;

  const crumbs = [
    { name: t.breadcrumbHome, href: href(lang) },
    { name: t.shop.title, href: href(lang, paths.shop) },
    ...(activeCategory ? [{ name: activeCategory.name[lang] }] : []),
  ];

  return (
    <div className="container-page pt-6 sm:pt-8">
      <Breadcrumbs items={crumbs} label={t.a11y.breadcrumb} />
      <header className="mt-5 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink/80">{intro}</p>
      </header>

      <div className="mt-8 space-y-4">
        {categories.length > 0 && (
          <nav aria-label={t.shop.categories} className="-mx-1 overflow-x-auto px-1 pb-1">
            <ul className="flex gap-2">
              <li><Link href={href(lang, paths.shop)} className={chip(!activeCategory)} aria-current={!activeCategory ? "page" : undefined}>{t.shop.all}</Link></li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={href(lang, paths.category(c.slug))} className={chip(activeCategory?.id === c.id)} aria-current={activeCategory?.id === c.id ? "page" : undefined}>
                    {c.name[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-sand/60 p-3">
          {availableTones.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.shop.tone}>
              <span className="px-1 text-sm font-semibold">{t.shop.tone}</span>
              <Link href={qs({ tone: null })} className={chip(!tone)} rel="nofollow" aria-current={!tone ? "true" : undefined}>{t.shop.tones.all}</Link>
              {availableTones.map((x) => (
                <Link key={x} href={qs({ tone: x })} className={chip(tone === x)} rel="nofollow" aria-current={tone === x ? "true" : undefined}>
                  {t.shop.tones[x]}
                </Link>
              ))}
            </div>
          ) : <span />}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.shop.sort}>
            <span className="px-1 text-sm font-semibold">{t.shop.sort}</span>
            {SORTS.map((s) => (
              <Link key={s} href={qs({ sort: s })} className={chip(sort === s)} rel="nofollow" aria-current={sort === s ? "true" : undefined}>
                {t.shop.sorts[s]}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted" aria-live="polite">{fmt(t.shop.count, { count: products.length })}</p>
      </div>

      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} lang={lang} priority={i < 2} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[20px] bg-paper p-10 text-center shadow-soft">
          <p className="text-muted">{t.shop.empty}</p>
          <Link href={href(lang, basePath)} className="btn btn-primary mt-5">{t.shop.reset}</Link>
        </div>
      )}

      {guides.length > 0 && (
        <aside className="mt-16" aria-labelledby="shop-guides">
          <h2 id="shop-guides" className="text-2xl">{t.shop.relatedGuides}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            <li><Link href={href(lang, paths.sizeGuide)} className={chip(false)}>{t.nav.sizeGuide}</Link></li>
            {guides.slice(0, 3).map((g) => (
              <li key={g.id}><Link href={href(lang, paths.guide(g.slug))} className={chip(false)}>{g.title[lang]}</Link></li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
