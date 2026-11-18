"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { placeOrder, type CheckoutState } from "@/app/[lang]/commande/actions";
import { useCart } from "../cart/CartProvider";
import QtyStepper from "../cart/QtyStepper";
import type { CartItem } from "../cart/cart-store";
import { CashIcon, CheckIcon } from "../icons";
import { fmt, formatPrice, type Lang } from "@/lib/format";
import { MAX_QTY_PER_LINE, shippingFor, type ShippingSettings } from "@/lib/pricing";

type Texts = {
  checkout: {
    title: string; intro: string; contact: string; name: string; namePh: string; phone: string; phonePh: string; phoneHelp: string;
    city: string; cityPh: string; address: string; addressPh: string; note: string; notePh: string; summary: string; submit: string;
    submitting: string; cod: string; emptyCart: string; backToShop: string; secure: string;
  };
  cart: { subtotal: string; shipping: string; free: string; total: string; sizeLabel: string; remove: string; leftForFree: string; freeReached: string };
  thanks: { title: string; ref: string; text: string; whatsapp: string; whatsappHelp: string; back: string; waMessage: string };
  a11y: { increase: string; decrease: string; quantity: string };
};

type Props = { lang: Lang; t: Texts; cities: { value: string; label: string }[]; whatsappNumber: string; shippingSettings: ShippingSettings };

type Done = { ref: string; total: number; items: CartItem[]; name: string; city: string };

export default function CheckoutForm({ lang, t, cities, whatsappNumber, shippingSettings }: Props) {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const [values, setValues] = useState({ name: "", phone: "", city: "", address: "", note: "" });
  const [done, setDone] = useState<Done | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [state, action, pending] = useActionState<CheckoutState, FormData>(async (prev, fd) => {
    const snapshot = items;
    const res = await placeOrder(prev, fd);
    if (res.status === "success") {
      setDone({ ref: res.ref, total: res.total, items: snapshot, name: values.name, city: cities.find((c) => c.value === values.city)?.label ?? values.city });
      clear();
    } else if (res.status === "error" && res.adjust) {
      for (const a of res.adjust) {
        const key = `${a.productId}:${a.colorKey}:${a.size}`;
        if (a.available <= 0) remove(key);
        else setQty(key, a.available);
      }
    }
    return res;
  }, { status: "idle" });

  const errors = state.status === "error" ? state.fields ?? {} : {};

  useEffect(() => {
    if (state.status !== "error") return;
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (first) first.focus();
    else resultRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [done]);

  if (done) {
    const lines = done.items.map((i) => `- ${i.qty} × ${i.name[lang]} (${i.color[lang]}, ${fmt(t.cart.sizeLabel, { size: i.size })})`).join("\n");
    const total = formatPrice(done.total, lang);
    const msg = fmt(t.thanks.waMessage, { ref: done.ref, total, items: lines, name: done.name, city: done.city });
    return (
      <div className="mx-auto max-w-xl animate-fade-up rounded-[24px] bg-paper p-6 text-center shadow-lift sm:p-10" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-whatsapp/15 text-success"><CheckIcon width={30} height={30} /></span>
        <h1 className="mt-5 text-3xl sm:text-4xl">{t.thanks.title}</h1>
        <p className="mt-4 text-sm text-muted">{t.thanks.ref}</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-widest" dir="ltr">{done.ref}</p>
        <p className="mt-4 leading-relaxed text-ink/80">{fmt(t.thanks.text, { total })}</p>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-7 w-full">
          {t.thanks.whatsapp}
        </a>
        <p className="mt-2 text-xs text-muted">{t.thanks.whatsappHelp}</p>
        <Link href={`/${lang}/boutique`} className="btn btn-outline mt-5 w-full">{t.thanks.back}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-[24px] bg-paper p-10 text-center shadow-soft">
        <h1 className="text-3xl">{t.checkout.title}</h1>
        <p className="mt-3 text-muted">{t.checkout.emptyCart}</p>
        <Link href={`/${lang}/boutique`} className="btn btn-primary mt-6">{t.checkout.backToShop}</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal, shippingSettings);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const err = (k: "name" | "phone" | "city" | "address") =>
    errors[k] ? <p id={`${k}-error`} className="mt-1.5 text-sm font-medium text-accent-dark">{errors[k]}</p> : null;
  const aria = (k: "name" | "phone" | "city" | "address", extra?: string) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": [errors[k] ? `${k}-error` : "", extra ?? ""].filter(Boolean).join(" ") || undefined,
  });

  return (
    <div>
      <h1 className="text-4xl sm:text-5xl">{t.checkout.title}</h1>
      <p className="mt-3 max-w-2xl text-ink/80">{t.checkout.intro}</p>

      <form ref={formRef} action={action} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, colorKey: i.colorKey, size: i.size, qty: i.qty })))} />
        {/* Honeypot (hidden from people and assistive tech) */}
        <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
          <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <fieldset className="space-y-5 rounded-[24px] bg-paper p-5 shadow-soft sm:p-7" disabled={pending}>
          <legend className="sr-only">{t.checkout.contact}</legend>
          <h2 className="text-2xl" aria-hidden="true">{t.checkout.contact}</h2>
          <div>
            <label htmlFor="co-name" className="label">{t.checkout.name}</label>
            <input id="co-name" name="name" className="field" autoComplete="name" placeholder={t.checkout.namePh} value={values.name} onChange={set("name")} required maxLength={80} {...aria("name")} />
            {err("name")}
          </div>
          <div>
            <label htmlFor="co-phone" className="label">{t.checkout.phone}</label>
            <input id="co-phone" name="phone" type="tel" inputMode="tel" dir="ltr" className="field text-start rtl:text-end" autoComplete="tel" placeholder={t.checkout.phonePh} value={values.phone} onChange={set("phone")} required maxLength={20} {...aria("phone", "phone-help")} />
            <p id="phone-help" className="mt-1.5 text-xs text-muted">{t.checkout.phoneHelp}</p>
            {err("phone")}
          </div>
          <div>
            <label htmlFor="co-city" className="label">{t.checkout.city}</label>
            <select id="co-city" name="city" className="field appearance-none" autoComplete="address-level2" value={values.city} onChange={set("city")} required {...aria("city")}>
              <option value="">{t.checkout.cityPh}</option>
              {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {err("city")}
          </div>
          <div>
            <label htmlFor="co-address" className="label">{t.checkout.address}</label>
            <textarea id="co-address" name="address" rows={3} className="field resize-y" autoComplete="street-address" placeholder={t.checkout.addressPh} value={values.address} onChange={set("address")} required maxLength={300} {...aria("address")} />
            {err("address")}
          </div>
          <div>
            <label htmlFor="co-note" className="label">{t.checkout.note}</label>
            <input id="co-note" name="note" className="field" placeholder={t.checkout.notePh} value={values.note} onChange={set("note")} maxLength={300} />
          </div>
          <p className="text-xs text-muted">{t.checkout.secure}</p>
        </fieldset>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[24px] bg-paper p-5 shadow-soft sm:p-7">
            <h2 className="text-2xl">{t.checkout.summary}</h2>
            <ul className="mt-4 divide-y divide-line">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3 py-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold">{i.name[lang]}</p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(i.price * i.qty, lang)}</p>
                    </div>
                    <p className="text-xs text-muted">{i.color[lang]} · {fmt(t.cart.sizeLabel, { size: i.size })}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper value={i.qty} max={Math.min(MAX_QTY_PER_LINE, i.maxQty)} onChange={(q) => setQty(i.key, q)} labels={t.a11y} />
                      <button type="button" onClick={() => remove(i.key)} className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline">{t.cart.remove}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{t.cart.subtotal}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">{t.cart.shipping}</dt><dd className="tabular-nums">{shipping === 0 ? t.cart.free : formatPrice(shipping, lang)}</dd></div>
              <div className="flex justify-between pt-1 text-lg font-semibold"><dt>{t.cart.total}</dt><dd className="tabular-nums">{formatPrice(subtotal + shipping, lang)}</dd></div>
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sand/70 p-3 text-sm"><CashIcon width={20} height={20} className="shrink-0 text-accent-dark" /> {t.checkout.cod}</p>

            <div ref={resultRef} tabIndex={-1} aria-live="assertive" className="outline-none">
              {state.status === "error" && state.message && (
                <p role="alert" className="mt-4 rounded-2xl border border-accent-dark/30 bg-accent-dark/5 p-3 text-sm font-medium text-accent-dark">{state.message}</p>
              )}
            </div>
            <button type="submit" className="btn btn-accent mt-5 w-full text-base" disabled={pending}>
              {pending ? t.checkout.submitting : `${t.checkout.submit} — ${formatPrice(subtotal + shipping, lang)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
