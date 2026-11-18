"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { addProductImageAction, deleteProductImageAction, moveProductImageAction, saveImageAltAction, type AdminResult } from "@/app/admin/actions";
import { uploadToCloudinary } from "./upload";
import { Notice } from "./fields";
import type { L10n, ProductImageDTO } from "@/lib/types";

function AltForm({ productId, colorKey, img }: { productId: string; colorKey: string; img: ProductImageDTO }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveImageAltAction, null);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={img.id} />
      <input type="hidden" name="colorKey" value={colorKey} />
      <input name="alt_fr" defaultValue={img.alt.fr} placeholder="Texte alternatif (FR)" className="field !py-2 text-sm" aria-label="Texte alternatif (FR)" />
      <input name="alt_ar" defaultValue={img.alt.ar} placeholder="النص البديل (AR)" dir="rtl" className="field !py-2 text-sm" aria-label="Texte alternatif (AR)" />
      <button className="rounded-full bg-sand px-3 py-1.5 text-xs font-medium hover:bg-line" disabled={pending}>{pending ? "…" : "Enregistrer le texte"}</button>
      {state && <span className={`ms-2 text-xs ${state.ok ? "text-success" : "text-accent-dark"}`}>{state.message}</span>}
    </form>
  );
}

export default function ImageManager({ productId, colorKey, images, defaultAlt }: { productId: string; colorKey: string; images: ProductImageDTO[]; defaultAlt: L10n }) {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [busy, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setResult(null);
    const list = Array.from(files).slice(0, Math.max(0, 12 - images.length));
    for (let i = 0; i < list.length; i++) {
      setProgress(`Envoi ${i + 1}/${list.length}…`);
      try {
        const up = await uploadToCloudinary(list[i], "products");
        const n = images.length + i + 1;
        const res = await addProductImageAction(productId, colorKey, up.url, up.publicId, { fr: `${defaultAlt.fr} — photo ${n}`, ar: `${defaultAlt.ar} — صورة ${n}` });
        if (!res.ok) { setResult(res); break; }
      } catch (err) {
        setResult({ ok: false, message: err instanceof Error ? err.message : "Échec de l’envoi." });
        break;
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
    startTransition(() => setResult((r) => r ?? { ok: true, message: "Images ajoutées." }));
  }

  const run = (fn: () => Promise<AdminResult>) => startTransition(async () => setResult(await fn()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className={`btn btn-primary cursor-pointer ${progress ? "pointer-events-none opacity-60" : ""}`}>
          {progress ?? "Ajouter des images"}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={!!progress || images.length >= 12} />
        </label>
        <p className="text-xs text-muted">JPG, PNG, WebP · 10 Mo max · 12 photos max par couleur. La 1re photo est la principale, la 2e apparaît au survol.</p>
      </div>
      <Notice result={result} />
      {images.length === 0 ? (
        <p className="rounded-2xl bg-sand/60 p-4 text-sm text-muted">Aucune image. Ajoutez au moins une photo (format portrait 4:5 conseillé).</p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className={`rounded-[20px] border border-line bg-cream p-3 ${busy ? "opacity-70" : ""}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand">
                <Image src={img.url} alt={img.alt.fr} fill sizes="300px" className="object-cover" />
                <span className="absolute start-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-paper">{i === 0 ? "Principale" : i + 1}</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <button type="button" className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" disabled={i === 0 || busy} onClick={() => run(() => moveProductImageAction(productId, colorKey, img.id, -1))} aria-label={`Monter l’image ${i + 1}`}>←</button>
                <button type="button" className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" disabled={i === images.length - 1 || busy} onClick={() => run(() => moveProductImageAction(productId, colorKey, img.id, 1))} aria-label={`Descendre l’image ${i + 1}`}>→</button>
                <button type="button" className="ms-auto rounded-full px-3 py-1.5 text-sm text-accent-dark hover:bg-accent-dark/10 disabled:opacity-40" disabled={busy} onClick={() => confirm("Supprimer cette image (aussi sur Cloudinary) ?") && run(() => deleteProductImageAction(productId, colorKey, img.id))}>Supprimer</button>
              </div>
              <div className="mt-2"><AltForm productId={productId} colorKey={colorKey} img={img} /></div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
