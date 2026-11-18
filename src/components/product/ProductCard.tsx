import Image from "next/image";
import Link from "next/link";
import Price from "./Price";
import { getDictionary } from "@/lib/i18n";
import { href, paths } from "@/lib/routes";
import type { Locale } from "@/lib/locales";
import type { ProductDTO } from "@/lib/types";
import { fmt, formatPrice } from "@/lib/format";
import { colorByKey, colorStock, defaultColor, minPriceOf, oldPriceOf, priceOf, totalStock } from "@/lib/product";

/** colorKey: colour to show (e.g. the one matching a shop filter); default = first colour in stock. */
export default function ProductCard({ product, lang, priority = false, headingLevel = "h3", colorKey }: { product: ProductDTO; lang: Locale; priority?: boolean; headingLevel?: "h2" | "h3"; colorKey?: string }) {
  const t = getDictionary(lang);
  const color = colorByKey(product, colorKey) ?? defaultColor(product);
  const [first, second] = color.images;
  const soldOut = totalStock(product) <= 0;
  const samePrice = product.colors.every((c) => priceOf(product, c) === priceOf(product, color));
  const link = href(lang, paths.product(product.slug)) + (colorKey ? `?couleur=${color.key}` : "");
  const shown = product.colors.slice(0, 6);
  const Heading = headingLevel;
  const badge = product.badge === "best" ? t.product.badgeBest : product.badge === "new" ? t.product.badgeNew : null;
  return (
    <article className="group relative">
      <Link href={link} className="block rounded-[20px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-sand shadow-soft transition duration-300 group-hover:shadow-lift">
          {first && (
            <Image
              src={first.url}
              alt={first.alt[lang] || `${product.name[lang]} — ${color.name[lang]}`}
              fill
              preload={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition duration-500 group-hover:scale-[1.03] ${second ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {second && (
            <Image
              src={second.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          )}
          {badge && (
            <span className={`absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${product.badge === "best" ? "bg-ink text-paper" : "bg-paper text-ink"}`}>
              {badge}
            </span>
          )}
          {soldOut && (
            <span className="absolute end-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-muted">{t.product.soldOut}</span>
          )}
        </div>
        <div className="mt-3 px-1">
          <Heading className="text-[15px] font-semibold leading-snug" style={{ fontFamily: "inherit" }}>{product.name[lang]}</Heading>
          <div className="mt-1.5 flex items-center gap-2">
            <ul className="flex items-center gap-1" aria-label={fmt(t.product.colorsCount, { count: product.colors.length })}>
              {shown.map((c) => (
                <li
                  key={c.key}
                  title={colorStock(c) > 0 ? c.name[lang] : fmt(t.product.colorSoldOut, { name: c.name[lang] })}
                  className={`h-3.5 w-3.5 rounded-full ring-1 ring-ink/20 ${c.key === color.key ? "outline outline-1 outline-offset-1 outline-ink" : ""} ${colorStock(c) > 0 ? "" : "opacity-40"}`}
                  style={{ background: c.hex }}
                />
              ))}
            </ul>
            <span className="text-xs text-muted">
              {product.colors.length > 1 ? fmt(t.product.colorsCount, { count: product.colors.length }) : color.name[lang]}
            </span>
          </div>
          <p className="mt-1.5">
            {samePrice ? (
              <Price price={priceOf(product, color)} oldPrice={oldPriceOf(product, color)} lang={lang} />
            ) : (
              <span className="font-semibold tabular-nums">{fmt(t.product.fromPrice, { price: formatPrice(minPriceOf(product), lang) })}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
