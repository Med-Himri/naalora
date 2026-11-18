"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { saveHeroAltAction, setHeroImageAction, type AdminResult } from "@/app/admin/actions";
import { uploadToCloudinary } from "./upload";
import { Notice } from "./fields";
import type { HeroDTO } from "@/lib/types";

export const DEFAULT_HERO = "/hero/naalora-hero.webp";

export default function HeroImageForm({ hero }: { hero: HeroDTO }) {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const [altState, altAction, altPending] = useActionState<AdminResult | null, FormData>(saveHeroAltAction, null);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const up = await uploadToCloudinary(file, "site");
      const res = await setHeroImageAction(up.url, up.publicId);
      startTransition(() => setResult(res));
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Échec de l’envoi." });
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand ring-1 ring-line">
        <Image src={hero.url || DEFAULT_HERO} alt="" fill sizes="200px" className="object-cover" />
        <span className="absolute start-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-paper">{hero.url ? "Votre image" : "Image par défaut"}</span>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          L’image en haut de la page d’accueil. Format portrait conseillé (4:5, par ex. 1200 × 1500 px), une photo d’ambiance plutôt qu’une photo produit. Sans image, une illustration Naalora est affichée.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className={`btn btn-primary cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
            {busy ? "Envoi…" : hero.url ? "Remplacer l’image" : "Choisir une image"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
          </label>
          {hero.url && (
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm text-accent-dark hover:bg-accent-dark/10"
              onClick={() => confirm("Revenir à l’illustration par défaut ?") && startTransition(async () => setResult(await setHeroImageAction(null, null)))}
            >
              Revenir à l’image par défaut
            </button>
          )}
        </div>
        <Notice result={result} />
        <form action={altAction} className="space-y-2">
          <p className="label !mb-0">Texte alternatif (décrit l’image pour Google et les lecteurs d’écran)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="alt_fr" defaultValue={hero.alt.fr} placeholder="Ex. Femme en pantoufles plateforme dans un riad" className="field" aria-label="Texte alternatif (FR)" maxLength={160} />
            <input name="alt_ar" defaultValue={hero.alt.ar} placeholder="النص البديل" dir="rtl" className="field" aria-label="Texte alternatif (AR)" maxLength={160} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-sand px-4 py-2 text-sm font-medium hover:bg-line" disabled={altPending}>{altPending ? "…" : "Enregistrer le texte"}</button>
            <div className="flex-1"><Notice result={altState} /></div>
          </div>
        </form>
      </div>
    </div>
  );
}
