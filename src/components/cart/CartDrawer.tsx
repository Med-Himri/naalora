"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import QtyStepper from "./QtyStepper";
import { CloseIcon, BagIcon, TruckIcon } from "../icons";
import { fmt, formatPrice, type Lang } from "@/lib/format";
import { FREE_SHIPPING_FROM, MAX_QTY_PER_LINE, shippingFor } from "@/lib/pricing";

export type CartTexts = {
  title: string; empty: string; emptyCta: string; subtotal: string; shipping: string; free: string; total: string;
  leftForFree: string; freeReached: string; checkout: string; continue: string; sizeLabel: string; remove: string;
  closeCart: string; increase: string; decrease: string; quantity: string; removeAria: string;
};

export default function CartDrawer({ lang, t }: { lang: Lang; t: CartTexts }) {
  const { items, isOpen, close, subtotal, setQty, remove } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [isOpen, close]);

  const shipping = shippingFor(subtotal);
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        inert={!isOpen}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] sm:inset-y-3 sm:end-3 sm:rounded-[24px] ${
          isOpen ? "translate-x-0" : "translate-x-[105%] rtl:-translate-x-[105%]"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 id="cart-title" className="text-2xl">{t.title}</h2>
          <button ref={closeBtn} type="button" onClick={close} className="grid h-11 w-11 place-items-center rounded-full bg-paper transition hover:bg-sand" aria-label={t.closeCart}>
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-sand text-brown"><BagIcon width={28} height={28} /></span>
            <p className="text-muted">{t.empty}</p>
            <Link href={`/${lang}/boutique`} className="btn btn-primary" onClick={close}>{t.emptyCta}</Link>
          </div>
        ) : (
          <>
            <div className="mx-5 rounded-2xl bg-paper p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <TruckIcon width={18} height={18} className="text-accent" />
                {left > 0 ? fmt(t.leftForFree, { amount: formatPrice(left, lang) }) : t.freeReached}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="mt-3 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 rounded-2xl bg-paper p-3">
                  <Link href={`/${lang}/produit/${item.slug}`} onClick={close} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/${lang}/produit/${item.slug}`} onClick={close} className="line-clamp-2 text-sm font-semibold hover:underline">
                        {item.name[lang]}
                      </Link>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(item.price * item.qty, lang)}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{item.color[lang]} · {fmt(t.sizeLabel, { size: item.size })}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper
                        value={item.qty}
                        max={Math.min(MAX_QTY_PER_LINE, item.maxQty)}
                        onChange={(q) => setQty(item.key, q)}
                        labels={{ increase: t.increase, decrease: t.decrease, quantity: t.quantity }}
                      />
                      <button type="button" onClick={() => remove(item.key)} className="rounded-full px-2 py-1 text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline" aria-label={fmt(t.removeAria, { name: item.name[lang] })}>
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-paper px-5 pb-5 pt-4 sm:rounded-b-[24px]">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted">{t.subtotal}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">{t.shipping}</dt><dd className="tabular-nums">{shipping === 0 ? t.free : formatPrice(shipping, lang)}</dd></div>
                <div className="flex justify-between pt-1 text-base font-semibold"><dt>{t.total}</dt><dd className="tabular-nums">{formatPrice(subtotal + shipping, lang)}</dd></div>
              </dl>
              <Link href={`/${lang}/commande`} onClick={close} className="btn btn-accent mt-4 w-full">{t.checkout}</Link>
              <button type="button" onClick={close} className="mt-2 w-full py-2 text-sm font-medium text-muted hover:text-ink">{t.continue}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
