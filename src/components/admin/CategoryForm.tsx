"use client";

import { useActionState } from "react";
import { saveCategoryAction, type AdminResult } from "@/app/admin/actions";
import { L10nFields, Notice, TextField } from "./fields";
import { keepFormSubmit } from "./useKeepForm";
import type { CategoryDTO } from "@/lib/types";

export default function CategoryForm({ category }: { category?: CategoryDTO }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveCategoryAction, null);
  const e = state?.errors ?? {};
  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      <L10nFields base="name" label="Nom" values={category?.name} errors={e} required />
      <TextField name="slug" label="Slug (URL)" defaultValue={category?.slug} error={e.slug} hint="Ex. pantoufles, baskets, sandales. Vide = généré depuis le nom FR." dir="ltr" />
      <L10nFields base="intro" label="Introduction SEO (2–3 phrases)" values={category?.intro} errors={e} multiline rows={3} />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary !min-h-10 !py-2" disabled={pending}>{pending ? "Enregistrement…" : category ? "Enregistrer" : "Créer la catégorie"}</button>
        <div className="flex-1"><Notice result={state} /></div>
      </div>
    </form>
  );
}
