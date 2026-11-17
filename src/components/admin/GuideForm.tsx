"use client";

import { useActionState } from "react";
import { saveGuideAction, type AdminResult } from "@/app/admin/actions";
import { L10nFields, Notice, Section, TextField } from "./fields";
import { keepFormSubmit } from "./useKeepForm";
import type { GuideDTO } from "@/lib/types";

export default function GuideForm({ guide }: { guide?: GuideDTO }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveGuideAction, null);
  const e = state?.errors ?? {};
  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-5">
      {guide && <input type="hidden" name="id" value={guide.id} />}
      <Section title="Article">
        <L10nFields base="title" label="Titre" values={guide?.title} errors={e} required />
        <TextField name="slug" label="Slug (URL)" defaultValue={guide?.slug} error={e.slug} hint="Vide = généré depuis le titre FR." dir="ltr" />
        <L10nFields base="excerpt" label="Résumé (meta description, ~155 caractères)" values={guide?.excerpt} errors={e} multiline rows={2} />
        <L10nFields base="coverAlt" label="Texte alternatif de la couverture" values={guide?.cover.alt} />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={guide?.published ?? false} className="h-5 w-5 accent-[#2b2420]" /> Publié (visible sur le site)
        </label>
      </Section>
      <Section title="Contenu (Markdown)">
        <p className="text-xs text-muted">## Titre de section · **gras** · - liste · 1. liste numérotée · [lien](/fr/boutique) · | tableau |. Commencez par une réponse directe en une phrase.</p>
        <L10nFields base="content" label="Contenu" values={guide?.content} errors={e} multiline rows={18} mono />
      </Section>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-[20px] border border-line bg-paper/95 p-3 shadow-lift backdrop-blur">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : guide ? "Enregistrer" : "Créer le guide"}</button>
        <div className="flex-1"><Notice result={state} /></div>
      </div>
    </form>
  );
}
