"use client";

import { useState } from "react";
import { generateProductDraftAction, type AiDraftResult } from "@/app/admin/actions";
import { SparkIcon } from "../icons";

/** Shrinks a photo in the browser before sending it (max 1024 px, JPEG). */
async function toDataUrl(file: File, max = 1024): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

type Draft = Extract<AiDraftResult, { ok: true }>["draft"];

export default function AiProductAssistant({ onDraft, ready, models }: { onDraft: (draft: Draft) => void; ready: boolean; models: string[] }) {
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiDraftResult | null>(null);

  async function onFile(file?: File) {
    setResult(null);
    if (!file) return setImage(null);
    if (!file.type.startsWith("image/")) return setResult({ ok: false, message: "Choisissez une image (JPG, PNG, WebP)." });
    try {
      setImage(await toDataUrl(file));
    } catch {
      setResult({ ok: false, message: "Impossible de lire cette image." });
    }
  }

  async function generate() {
    setBusy(true);
    setResult(null);
    try {
      const res = await generateProductDraftAction({ note, image });
      setResult(res);
      if (res.ok) onDraft(res.draft);
    } catch {
      setResult({ ok: false, message: "Erreur réseau. Réessayez." });
    }
    setBusy(false);
  }

  return (
    <section id="assistant-ia" className="scroll-mt-28 space-y-4 rounded-[20px] border border-accent-dark/25 bg-paper p-5 shadow-soft sm:p-6" aria-labelledby="ai-title">
      <div className="flex items-center gap-2">
        <SparkIcon className="text-accent-dark" />
        <h2 id="ai-title" className="text-xl">Assistant IA</h2>
      </div>
      {!ready && (
        <p role="alert" className="rounded-2xl bg-accent-dark/10 px-4 py-3 text-sm font-medium text-accent-dark">
          Assistant désactivé : ajoutez <code>GROQ_API_KEY=…</code> dans <code>.env.local</code> (clé sur console.groq.com/keys), puis relancez <code>npm run dev</code>.
        </p>
      )}
      <p className="text-xs text-muted">Modèles (dans l’ordre) : {models.join(" → ")}</p>
      <p className="text-sm text-muted">
        Ajoutez une photo et/ou une note : l’IA remplit le formulaire en français et en arabe. Vérifiez tout avant d’enregistrer — les prix et le stock ne sont jamais inventés.
      </p>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="relative flex aspect-[4/5] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-cream text-center text-sm text-muted hover:border-ink">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of a data URL
            <img src={image} alt="Photo envoyée à l’IA" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="px-3">+ Photo du produit</span>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
        </label>
        <div className="flex flex-col gap-3">
          <label htmlFor="ai-note" className="label !mb-0">Note (facultatif)</label>
          <textarea
            id="ai-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1500}
            className="field resize-y"
            placeholder="Ex. : bottine chelsea femme, similicuir beige, patte à boucle, semelle crantée 4 cm, tailles 36-41, prix 449 MAD"
            disabled={busy}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-accent" onClick={generate} disabled={!ready || busy || (!note.trim() && !image)}>
              {busy ? "Rédaction en cours…" : "Générer la fiche"}
            </button>
            {image && (
              <button type="button" className="text-sm text-muted underline underline-offset-4 hover:text-ink" onClick={() => setImage(null)} disabled={busy}>
                Retirer la photo
              </button>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div role={result.ok ? "status" : "alert"} className={`rounded-2xl px-4 py-3 text-sm ${result.ok ? "bg-success/10 text-success" : "bg-accent-dark/10 text-accent-dark"}`}>
          <p className="font-medium">
            {result.ok
              ? `Fiche remplie par ${result.model}. Vérifiez les textes, puis indiquez le prix, les tailles et le stock.`
              : result.message}
          </p>
          {result.attempts && result.attempts.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-ink/70">
              {result.attempts.map((a, i) => (
                <li key={i}>
                  {a.ok ? "✓" : "✗"} {a.model}
                  {a.ms ? ` · ${(a.ms / 1000).toFixed(1)} s` : ""}
                  {a.error ? ` · ${a.error}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
