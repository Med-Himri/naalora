"use client";

import { useEffect, useState, type ReactNode } from "react";
import Gallery from "./Gallery";
import Price from "./Price";
import ProductPurchase, { type PurchaseTexts } from "./ProductPurchase";
import { fmt, type Lang } from "@/lib/format";
import { colorByKey, colorStock, oldPriceOf, priceOf } from "@/lib/product";
import type { ProductDTO } from "@/lib/types";

export type ProductViewTexts = PurchaseTexts & {
  color: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  save: string;
  thumbnail: string;
  colorSoldOut: string;
};

type Props = {
  lang: Lang;
  product: ProductDTO;
  /** Colour rendered on the server (first in stock). */
  initialKey: string;
  sizeGuideHref: string;
  t: ProductViewTexts;
  /** Server-rendered blocks: badge + title + summary, and the blocks under the purchase box. */
  header: ReactNode;
  footer: ReactNode;
};

/**
 * Product page body: the selected colour drives the photos, price, stock and sizes.
 * The colour is kept in the URL (?couleur=…) so a link opens the same colour.
 */
export default function ProductView({ lang, product, initialKey, sizeGuideHref, t, header, footer }: Props) {
  const [colorKey, setColorKey] = useState(initialKey);

  // A shared link (?couleur=rose) opens that colour.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("couleur");
    if (wanted && wanted !== initialKey && colorByKey(product, wanted)) {
      queueMicrotask(() => setColorKey(wanted));
    }
  }, [product, initialKey]);

  const color = colorByKey(product, colorKey) ?? product.colors[0];
  const stock = colorStock(color);
  const stockLine = stock <= 0 ? t.outOfStock : stock <= 5 ? fmt(t.lowStock, { count: stock }) : t.inStock;

  function select(key: string) {
    setColorKey(key);
    const url = new URL(window.location.href);
    url.searchParams.set("couleur", key);
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Gallery
          key={color.key}
          images={color.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt[lang] || `${product.name[lang]} — ${color.name[lang]}` }))}
          thumbLabel={t.thumbnail}
        />
      </div>

      <div>
        {header}

        <div className="mt-6">
          <Price price={priceOf(product, color)} oldPrice={oldPriceOf(product, color)} lang={lang} saveLabel={t.save} size="lg" />
          <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${stock <= 0 ? "text-muted" : "text-success"}`} aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${stock <= 0 ? "bg-muted" : "bg-whatsapp"}`} aria-hidden="true" />
            {stockLine}
          </p>
        </div>

        {product.colors.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">
              {t.color} : <span className="font-normal text-muted">{color.name[lang]}</span>
            </legend>
            <div role="radiogroup" aria-label={t.color} className="mt-3 flex flex-wrap gap-2.5">
              {product.colors.map((c) => {
                const out = colorStock(c) <= 0;
                const selected = c.key === color.key;
                const label = out ? fmt(t.colorSoldOut, { name: c.name[lang] }) : c.name[lang];
                return (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={label}
                    title={label}
                    onClick={() => select(c.key)}
                    className={`relative h-10 w-10 rounded-full ring-offset-2 ring-offset-cream transition ${selected ? "ring-2 ring-ink" : "ring-1 ring-ink/20 hover:ring-ink/50"}`}
                    style={{ background: c.hex }}
                  >
                    {out && <span className="absolute inset-0 m-auto h-[2px] w-11 -rotate-45 rounded bg-paper/90 shadow" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-7">
          <ProductPurchase
            key={color.key}
            lang={lang}
            sizeGuideHref={sizeGuideHref}
            product={{
              id: product.id,
              slug: product.slug,
              price: priceOf(product, color),
              name: product.name,
              colorKey: color.key,
              color: color.name,
              image: color.images[0]?.url ?? "",
              sizes: color.sizes,
            }}
            t={t}
          />
        </div>

        {footer}
      </div>
    </div>
  );
}
