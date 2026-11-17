"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { setGuideCoverAction, type AdminResult } from "@/app/admin/actions";
import { uploadToCloudinary } from "./upload";
import { Notice } from "./fields";

export default function CoverUploader({ guideId, url }: { guideId: string; url: string }) {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const up = await uploadToCloudinary(file, "guides");
      const res = await setGuideCoverAction(guideId, up.url, up.publicId);
      startTransition(() => setResult(res));
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Échec de l’envoi." });
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      {url ? (
        <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-xl bg-sand">
          <Image src={url} alt="" fill sizes="450px" className="object-cover" />
        </div>
      ) : (
        <p className="text-sm text-muted">Pas de couverture (optionnel, format 16:9 conseillé).</p>
      )}
      <div className="flex flex-wrap gap-2">
        <label className={`btn btn-primary !min-h-10 cursor-pointer !py-2 text-sm ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {busy ? "Envoi…" : url ? "Remplacer l’image" : "Ajouter une image"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
        </label>
        {url && (
          <button type="button" className="rounded-full px-4 py-2 text-sm text-accent-dark hover:bg-accent-dark/10" onClick={() => confirm("Supprimer la couverture ?") && startTransition(async () => setResult(await setGuideCoverAction(guideId, null, null)))}>
            Supprimer
          </button>
        )}
      </div>
      <Notice result={result} />
    </div>
  );
}
