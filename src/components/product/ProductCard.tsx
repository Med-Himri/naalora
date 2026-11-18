import Image from "next/image";
import Link from "next/link";
import Price from "./Price";
import { getDictionary } from "@/lib/i18n";
import { href, paths } from "@/lib/routes";
import type { Locale } from "@/lib/locales";
import type { ProductDTO } from "@/lib/types";

export default function ProductCard({ product, lang, priority = false, headingLevel = "h3" }: { product: ProductDTO; lang: Locale; priority?: boolean; headingLevel?: "h2" | "h3" }) {
  const t = getDictionary(lang);
  const [first, second] = product.images;
  const soldOut = product.sizes.every((s) => s.stock <= 0);
  const Heading = headingLevel;
  const badge = product.badge === "best" ? t.product.badgeBest : product.badge === "new" ? t.product.badgeNew : null;
  return (
    <article className="group relative">
      <Link href={href(lang, paths.product(product.slug))} className="block rounded-[20px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-sand shadow-soft transition duration-300 group-hover:shadow-lift">
          {first && (
            <Image
              src={first.url}
              alt={first.alt[lang] || product.name[lang]}
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
          <div className="flex items-start justify-between gap-2">
            <Heading className="text-[15px] font-semibold leading-snug" style={{ fontFamily: "inherit" }}>{product.name[lang]}</Heading>
            <span className="mt-1 h-4 w-4 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: product.swatchHex }} aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-sm text-muted">{product.colorName[lang]}</p>
          <p className="mt-1.5"><Price price={product.price} oldPrice={product.oldPrice} lang={lang} /></p>
        </div>
      </Link>
    </article>
  );
}
