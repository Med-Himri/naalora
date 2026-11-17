"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type AdminResult } from "@/app/admin/actions";
import { L10nFields, Notice, Section, TextField } from "./fields";
import { keepFormSubmit } from "./useKeepForm";
import type { CategoryDTO, ProductDTO } from "@/lib/types";

const TONES = [
  { v: "brown", l: "Bruns" },
  { v: "pastel", l: "Pastels" },
  { v: "dark", l: "Foncés" },
  { v: "other", l: "Autres" },
];
const BADGES = [
  { v: "none", l: "Aucun" },
  { v: "best", l: "Best-seller" },
  { v: "new", l: "Nouveau" },
];

export default function ProductForm({ product, categories }: { product?: ProductDTO; categories: CategoryDTO[] }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveProductAction, null);
  const e = state?.errors ?? {};
  const [rows, setRows] = useState(() =>
    (product?.sizes.length ? product.sizes : [36, 37, 38, 39, 40, 41].map((size) => ({ size, stock: 0 }))).map((s, i) => ({ key: i, size: String(s.size), stock: String(s.stock) })),
  );
  const [hex, setHex] = useState(product?.swatchHex ?? "#c98c55");

  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Identité">
        <L10nFields base="name" label="Nom" values={product?.name} errors={e} required />
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField name="slug" label="Slug (URL, en français)" defaultValue={product?.slug} error={e.slug} hint="Vide = généré depuis le nom FR." dir="ltr" />
          <TextField name="sku" label="Référence (SKU)" defaultValue={product?.sku} dir="ltr" />
          <div>
            <label htmlFor="f-categoryId" className="label">Catégorie <span className="text-accent-dark">*</span></label>
            <select id="f-categoryId" name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id ?? ""} className="field" aria-invalid={!!e.categoryId}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name.fr}</option>)}
            </select>
            {e.categoryId && <p className="mt-1 text-sm font-medium text-accent-dark">{e.categoryId}</p>}
          </div>
        </div>
      </Section>

      <Section title="Prix & mise en avant">
        <div className="grid gap-3 sm:grid-cols-4">
          <TextField name="price" label="Prix (MAD)" type="number" min={0} step={1} defaultValue={product?.price} error={e.price} required />
          <TextField name="oldPrice" label="Ancien prix (MAD)" type="number" min={0} step={1} defaultValue={product?.oldPrice} error={e.oldPrice} hint="Optionnel : affiche « −X »." />
          <div>
            <label htmlFor="f-badge" className="label">Badge</label>
            <select id="f-badge" name="badge" defaultValue={product?.badge ?? "none"} className="field">
              {BADGES.map((b) => <option key={b.v} value={b.v}>{b.l}</option>)}
            </select>
          </div>
          <TextField name="position" label="Position (ordre)" type="number" min={0} step={1} defaultValue={product?.position ?? 0} hint="Plus petit = affiché en premier." />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-5 w-5 accent-[#2b2420]" /> Produit actif (visible sur le site)
        </label>
      </Section>

      <Section title="Couleur">
        <L10nFields base="colorName" label="Nom de la couleur" values={product?.colorName} errors={e} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="f-swatchHex" className="label">Pastille couleur</label>
            <div className="flex items-center gap-3">
              <input type="color" value={hex} onChange={(ev) => setHex(ev.target.value)} className="h-12 w-14 cursor-pointer rounded-xl border border-line bg-paper" aria-label="Choisir la couleur" />
              <input id="f-swatchHex" name="swatchHex" value={hex} onChange={(ev) => setHex(ev.target.value)} className="field font-mono" dir="ltr" aria-invalid={!!e.swatchHex} />
            </div>
            {e.swatchHex && <p className="mt-1 text-sm font-medium text-accent-dark">{e.swatchHex}</p>}
          </div>
          <div>
            <label htmlFor="f-tone" className="label">Teinte (filtre boutique)</label>
            <select id="f-tone" name="tone" defaultValue={product?.tone ?? "other"} className="field">
              {TONES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Tailles & stock">
        <table className="w-full max-w-md text-sm">
          <thead><tr className="text-start text-muted"><th className="pb-2 text-start font-medium">Taille (EU)</th><th className="pb-2 text-start font-medium">Stock</th><th /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key}>
                <td className="pe-2 pb-2"><input name="size" inputMode="numeric" value={r.size} onChange={(ev) => setRows((rs) => rs.map((x, k) => (k === i ? { ...x, size: ev.target.value } : x)))} className="field !py-2" aria-label={`Taille ligne ${i + 1}`} /></td>
                <td className="pe-2 pb-2"><input name="stock" inputMode="numeric" value={r.stock} onChange={(ev) => setRows((rs) => rs.map((x, k) => (k === i ? { ...x, stock: ev.target.value } : x)))} className="field !py-2" aria-label={`Stock ligne ${i + 1}`} /></td>
                <td className="pb-2"><button type="button" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))} className="rounded-full px-3 py-2 text-sm text-muted hover:bg-sand hover:text-ink" aria-label={`Supprimer la ligne ${i + 1}`}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => setRows((rs) => [...rs, { key: Date.now(), size: "", stock: "0" }])} className="rounded-full bg-sand px-4 py-2 text-sm font-medium hover:bg-line">+ Ajouter une taille</button>
        {e.sizes && <p className="text-sm font-medium text-accent-dark">{e.sizes}</p>}
        <p className="text-xs text-muted">Stock 0 = taille affichée « Épuisé ». Le stock baisse automatiquement à chaque commande.</p>
      </Section>

      <Section title="Textes">
        <L10nFields base="summary" label="Résumé (2–3 phrases factuelles, affiché en haut de la fiche)" values={product?.summary} errors={e} multiline rows={3} />
        <L10nFields base="description" label="Description (paragraphes séparés par une ligne vide)" values={product?.description} errors={e} multiline rows={6} />
      </Section>

      <Section title="Caractéristiques">
        <L10nFields base="material" label="Matière" values={product?.specs.material} />
        <L10nFields base="lining" label="Doublure" values={product?.specs.lining} />
        <L10nFields base="soleHeight" label="Hauteur de semelle" values={product?.specs.soleHeight} />
        <L10nFields base="care" label="Entretien" values={product?.specs.care} />
      </Section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-[20px] border border-line bg-paper/95 p-3 shadow-lift backdrop-blur">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : product ? "Enregistrer" : "Créer le produit"}</button>
        <div className="flex-1"><Notice result={state} /></div>
      </div>
    </form>
  );
}
