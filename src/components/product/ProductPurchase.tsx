"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../cart/CartProvider";
import QtyStepper from "../cart/QtyStepper";
import { CheckIcon } from "../icons";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import type { Lang } from "@/lib/format";
import type { L10n, SizeDTO } from "@/lib/types";

export type PurchaseTexts = {
  size: string; soldOut: string; sizeGuide: string; quantity: string; addToCart: string; added: string;
  orderNow: string; chooseSize: string; increase: string; decrease: string;
};

type Props = {
  lang: Lang;
  t: PurchaseTexts;
  product: { id: string; slug: string; price: number; name: L10n; color: L10n; image: string; sizes: SizeDTO[] };
  sizeGuideHref: string;
};

export default function ProductPurchase({ lang, t, product, sizeGuideHref }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const stockOf = (s: number | null) => product.sizes.find((x) => x.size === s)?.stock ?? 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_LINE, stockOf(size)));
  const allSoldOut = product.sizes.every((s) => s.stock <= 0);

  function addToCart(openDrawer: boolean): boolean {
    if (size === null) {
      setError(true);
      document.getElementById("size-picker")?.focus();
      return false;
    }
    add(
      { productId: product.id, slug: product.slug, size, qty: Math.min(qty, maxQty), price: product.price, maxQty: stockOf(size), name: product.name, color: product.color, image: product.image },
      { open: openDrawer },
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    return true;
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-sm font-semibold">{t.size}</legend>
          <Link href={sizeGuideHref} className="text-sm text-muted underline underline-offset-4 hover:text-ink">{t.sizeGuide}</Link>
        </div>
        <div
          id="size-picker"
          tabIndex={-1}
          role="radiogroup"
          aria-label={t.size}
          aria-invalid={error}
          aria-describedby={error ? "size-error" : undefined}
          className="grid grid-cols-3 gap-2 outline-none sm:grid-cols-6"
        >
          {product.sizes.map((s) => {
            const out = s.stock <= 0;
            const selected = size === s.size;
            return (
              <button
                key={s.size}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={out}
                onClick={() => {
                  setSize(s.size);
                  setError(false);
                  setQty((q) => Math.min(q, Math.max(1, Math.min(MAX_QTY_PER_LINE, s.stock))));
                }}
                className={`relative flex h-14 flex-col items-center justify-center rounded-2xl border text-base font-semibold transition ${
                  out
                    ? "cursor-not-allowed border-line bg-sand/50 text-muted"
                    : selected
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper hover:border-ink"
                }`}
              >
                <span className={out ? "line-through decoration-1" : ""}>{s.size}</span>
                {out && <span className="text-[10px] font-medium">{t.soldOut}</span>}
              </button>
            );
          })}
        </div>
        {error && (
          <p id="size-error" role="alert" className="mt-2 text-sm font-medium text-accent-dark">{t.chooseSize}</p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">{t.quantity}</span>
        <QtyStepper value={qty} max={maxQty} onChange={setQty} size="md" labels={{ increase: t.increase, decrease: t.decrease, quantity: t.quantity }} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn btn-primary w-full" disabled={allSoldOut} onClick={() => addToCart(true)}>
          {added ? (<><CheckIcon width={18} height={18} /> {t.added}</>) : t.addToCart}
        </button>
        <button
          type="button"
          className="btn btn-accent w-full"
          disabled={allSoldOut}
          onClick={() => {
            if (addToCart(false)) router.push(`/${lang}/commande`);
          }}
        >
          {t.orderNow}
        </button>
      </div>
    </div>
  );
}
