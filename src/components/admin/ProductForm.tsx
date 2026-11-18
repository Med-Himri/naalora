"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type AdminResult } from "@/app/admin/actions";
import { L10nFields, Notice, Section, TextField } from "./fields";
import { keepFormSubmit } from "./useKeepForm";
import { slugKey } from "@/lib/product";
import type { CategoryDTO, ProductDTO, Tone } from "@/lib/types";

const TONES: { v: Tone; l: string }[] = [
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

type SizeRow = { size: string; stock: string };
type ColorRow = {
  uid: number; // React key only
  id: string; // existing colour id ("" = new)
  key: string;
  nameFr: string;
  nameAr: string;
  hex: string;
  tone: Tone;
  price: string;
  oldPrice: string;
  sizes: SizeRow[];
  photos: number;
};

let uidSeq = 1;
const DEFAULT_SIZES = [36, 37, 38, 39, 40, 41];

function toRows(product?: ProductDTO): ColorRow[] {
  if (!product?.colors.length) {
    return [{ uid: uidSeq++, id: "", key: "", nameFr: "", nameAr: "", hex: "#c98c55", tone: "brown", price: "", oldPrice: "", sizes: DEFAULT_SIZES.map((s) => ({ size: String(s), stock: "0" })), photos: 0 }];
  }
  return product.colors.map((c) => ({
    uid: uidSeq++,
    id: c.id,
    key: c.key,
    nameFr: c.name.fr,
    nameAr: c.name.ar,
    hex: c.hex,
    tone: c.tone,
    price: c.price === null ? "" : String(c.price),
    oldPrice: c.oldPrice === null ? "" : String(c.oldPrice),
    sizes: c.sizes.map((s) => ({ size: String(s.size), stock: String(s.stock) })),
    photos: c.images.length,
  }));
}

export default function ProductForm({ product, categories }: { product?: ProductDTO; categories: CategoryDTO[] }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(saveProductAction, null);
  const e = state?.errors ?? {};
  const [colors, setColors] = useState<ColorRow[]>(() => toRows(product));
  const saved = !!product?.id;

  const update = (uid: number, patch: Partial<ColorRow>) => setColors((cs) => cs.map((c) => (c.uid === uid ? { ...c, ...patch } : c)));
  const updateSize = (uid: number, i: number, patch: Partial<SizeRow>) =>
    setColors((cs) => cs.map((c) => (c.uid === uid ? { ...c, sizes: c.sizes.map((s, k) => (k === i ? { ...s, ...patch } : s)) } : c)));
  const move = (i: number, dir: -1 | 1) =>
    setColors((cs) => {
      const j = i + dir;
      if (j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const addColor = () =>
    setColors((cs) => [
      ...cs,
      {
        uid: uidSeq++,
        id: "",
        key: "",
        nameFr: "",
        nameAr: "",
        hex: "#888888",
        tone: "other",
        price: "",
        oldPrice: "",
        sizes: (cs[0]?.sizes.length ? cs[0].sizes : DEFAULT_SIZES.map((s) => ({ size: String(s), stock: "0" }))).map((s) => ({ size: s.size, stock: "0" })),
        photos: 0,
      },
    ]);
  const removeColor = (c: ColorRow) => {
    if (colors.length === 1) return;
    if (c.photos > 0 && !confirm(`Retirer la couleur « ${c.nameFr || "sans nom"} » ? Ses ${c.photos} photo(s) seront supprimées à l’enregistrement.`)) return;
    setColors((cs) => cs.filter((x) => x.uid !== c.uid));
  };

  const payload = JSON.stringify(
    colors.map((c) => ({
      id: c.id,
      key: c.key || slugKey(c.nameFr),
      name: { fr: c.nameFr, ar: c.nameAr },
      hex: c.hex,
      tone: c.tone,
      price: c.price.trim(),
      oldPrice: c.oldPrice.trim(),
      sizes: c.sizes.map((s) => ({ size: s.size.trim(), stock: s.stock.trim() })),
    })),
  );

  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-5">
      {saved && <input type="hidden" name="id" value={product!.id} />}
      <input type="hidden" name="colors" value={payload} />

      <Section title="Identité">
        <L10nFields base="name" label="Nom" values={product?.name} errors={e} required />
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField name="slug" label="Slug (URL, en français)" defaultValue={product?.slug} error={e.slug} hint="Vide = généré depuis le nom FR." dir="ltr" />
          <TextField name="sku" label="Référence (SKU)" defaultValue={product?.sku} dir="ltr" />
          <div>
            <label htmlFor="f-categoryId" className="label">Catégorie <span className="text-accent-dark">*</span></label>
            <select id="f-categoryId" name="categoryId" defaultValue={product?.categoryId || categories[0]?.id || ""} className="field" aria-invalid={!!e.categoryId}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name.fr}</option>)}
            </select>
            {e.categoryId && <p className="mt-1 text-sm font-medium text-accent-dark">{e.categoryId}</p>}
          </div>
        </div>
      </Section>

      <Section title="Prix & mise en avant">
        <div className="grid gap-3 sm:grid-cols-4">
          <TextField name="price" label="Prix (MAD)" type="number" min={0} step={1} defaultValue={product?.price || ""} error={e.price} required hint="Prix de toutes les couleurs (sauf exception ci-dessous)." />
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

      <Section title={`Couleurs (${colors.length})`}>
        <p className="text-sm text-muted">
          Le client choisit la couleur sur la fiche produit. Chaque couleur a ses photos, ses tailles et son stock.
          {saved ? " Les photos de chaque couleur se gèrent plus bas sur cette page." : " Les photos s’ajoutent après la création du produit."}
        </p>
        {e.colors && <p role="alert" className="rounded-2xl bg-accent-dark/10 px-4 py-3 text-sm font-medium text-accent-dark">{e.colors}</p>}

        <ol className="space-y-4">
          {colors.map((c, i) => {
            const total = c.sizes.reduce((n, s) => n + (Number(s.stock) || 0), 0);
            return (
              <li key={c.uid} className="rounded-2xl border border-line bg-cream p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="h-6 w-6 rounded-full ring-1 ring-ink/20" style={{ background: c.hex }} aria-hidden="true" />
                  <span className="font-semibold">{c.nameFr || `Couleur ${i + 1}`}</span>
                  <span className="text-xs text-muted">· stock {total}{saved && c.id ? ` · ${c.photos} photo(s)` : ""}</span>
                  <span className="ms-auto flex gap-1">
                    <button type="button" className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter la couleur ${i + 1}`}>↑</button>
                    <button type="button" className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => move(i, 1)} disabled={i === colors.length - 1} aria-label={`Descendre la couleur ${i + 1}`}>↓</button>
                    <button type="button" className="rounded-full px-3 py-1.5 text-sm text-accent-dark hover:bg-accent-dark/10 disabled:opacity-40" onClick={() => removeColor(c)} disabled={colors.length === 1}>Retirer</button>
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-fr`}>Nom de la couleur (FR) <span className="text-accent-dark">*</span></label>
                    <input id={`c-${c.uid}-fr`} className="field" value={c.nameFr} onChange={(ev) => update(c.uid, { nameFr: ev.target.value })} placeholder="Ex. Camel" maxLength={40} />
                  </div>
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-ar`}>Nom de la couleur (AR) <span className="text-accent-dark">*</span></label>
                    <input id={`c-${c.uid}-ar`} className="field" dir="rtl" value={c.nameAr} onChange={(ev) => update(c.uid, { nameAr: ev.target.value })} placeholder="مثال: كاميل" maxLength={40} />
                  </div>
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-hex`}>Pastille</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={c.hex} onChange={(ev) => update(c.uid, { hex: ev.target.value })} className="h-12 w-14 cursor-pointer rounded-xl border border-line bg-paper" aria-label="Choisir la couleur" />
                      <input id={`c-${c.uid}-hex`} className="field font-mono" dir="ltr" value={c.hex} onChange={(ev) => update(c.uid, { hex: ev.target.value })} maxLength={7} />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-tone`}>Teinte (filtre boutique)</label>
                    <select id={`c-${c.uid}-tone`} className="field" value={c.tone} onChange={(ev) => update(c.uid, { tone: ev.target.value as Tone })}>
                      {TONES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-price`}>Prix de cette couleur (MAD)</label>
                    <input id={`c-${c.uid}-price`} className="field" type="number" min={0} step={1} value={c.price} onChange={(ev) => update(c.uid, { price: ev.target.value })} placeholder="Vide = prix du produit" />
                  </div>
                  <div>
                    <label className="label" htmlFor={`c-${c.uid}-old`}>Ancien prix de cette couleur</label>
                    <input id={`c-${c.uid}-old`} className="field" type="number" min={0} step={1} value={c.oldPrice} onChange={(ev) => update(c.uid, { oldPrice: ev.target.value })} placeholder="Vide = celui du produit" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="label">Tailles & stock</p>
                  <div className="flex flex-wrap gap-2">
                    {c.sizes.map((s, k) => (
                      <div key={k} className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1.5">
                        <input className="w-12 rounded-lg bg-sand/60 px-2 py-1.5 text-center text-sm font-semibold" inputMode="numeric" value={s.size} onChange={(ev) => updateSize(c.uid, k, { size: ev.target.value })} aria-label={`Taille ${k + 1} de ${c.nameFr || "la couleur"}`} />
                        <input className="w-14 rounded-lg border border-line px-2 py-1.5 text-center text-sm" inputMode="numeric" value={s.stock} onChange={(ev) => updateSize(c.uid, k, { stock: ev.target.value })} aria-label={`Stock taille ${s.size}`} />
                        <button type="button" className="px-1 text-muted hover:text-ink" onClick={() => update(c.uid, { sizes: c.sizes.filter((_, x) => x !== k) })} aria-label={`Supprimer la taille ${s.size}`}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="rounded-xl bg-sand px-3 py-2 text-sm font-medium hover:bg-line" onClick={() => update(c.uid, { sizes: [...c.sizes, { size: "", stock: "0" }] })}>+ Taille</button>
                  </div>
                  <p className="mt-1 text-xs text-muted">Taille (gauche) · stock (droite). Stock 0 = « Épuisé ». Le stock baisse automatiquement à chaque commande.</p>
                </div>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={addColor} className="btn btn-outline">+ Ajouter une couleur</button>
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
        <button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : saved ? "Enregistrer" : "Créer le produit"}</button>
        <div className="flex-1"><Notice result={state} /></div>
      </div>
    </form>
  );
}
