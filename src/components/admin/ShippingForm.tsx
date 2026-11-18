"use client";

import { useActionState, useState } from "react";
import { saveShippingAction, type AdminResult } from "@/app/admin/actions";
import { Notice } from "./fields";
import { keepFormSubmit } from "./useKeepForm";
import type { ShippingSettings } from "@/lib/pricing";

export default function ShippingForm({ current }: { current: ShippingSettings }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveShippingAction, null);
  const [mode, setMode] = useState<"free" | "paid">(current.fee > 0 ? "paid" : "free");
  const e = state?.errors ?? {};
  const radio = (value: "free" | "paid", title: string, text: string) => (
    <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${mode === value ? "border-ink bg-cream" : "border-line hover:border-ink/40"}`}>
      <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="mt-1 h-4 w-4 accent-[#2b2420]" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted">{text}</span>
      </span>
    </label>
  );
  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {radio("free", "Livraison gratuite", "Gratuite partout au Maroc, quel que soit le montant.")}
        {radio("paid", "Livraison payante", "Un prix fixe, avec un seuil de gratuité facultatif.")}
      </div>
      {mode === "paid" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="f-fee" className="label">Prix de la livraison (MAD) <span className="text-accent-dark">*</span></label>
            <input id="f-fee" name="fee" type="number" min={1} step={1} defaultValue={current.fee || 35} className="field" aria-invalid={!!e.fee} />
            {e.fee && <p className="mt-1 text-sm font-medium text-accent-dark">{e.fee}</p>}
          </div>
          <div>
            <label htmlFor="f-freeFrom" className="label">Gratuite à partir de (MAD)</label>
            <input id="f-freeFrom" name="freeFrom" type="number" min={1} step={1} defaultValue={current.freeFrom ?? ""} placeholder="Ex. 500 — vide = jamais gratuite" className="field" aria-invalid={!!e.freeFrom} />
            {e.freeFrom ? <p className="mt-1 text-sm font-medium text-accent-dark">{e.freeFrom}</p> : <p className="mt-1 text-xs text-muted">Laissez vide pour ne pas offrir la livraison.</p>}
          </div>
        </div>
      )}
      <p className="text-xs text-muted">
        S’applique partout : panier, commande (calculé sur le serveur), fiches produits, FAQ, À propos, données Google et flux Merchant Center. Les commandes déjà passées ne changent pas.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
        <div className="flex-1"><Notice result={state} /></div>
      </div>
    </form>
  );
}
