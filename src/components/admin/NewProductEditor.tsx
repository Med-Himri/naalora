"use client";

import { useState } from "react";
import AiProductAssistant from "./AiProductAssistant";
import ProductForm from "./ProductForm";
import type { AiDraftResult } from "@/app/admin/actions";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { slugKey } from "@/lib/product";

type Draft = Extract<AiDraftResult, { ok: true }>["draft"];

/** Turns an AI draft into initial form values (a product that is not saved yet: id = ""). */
function draftToProduct(d: Draft, categories: CategoryDTO[]): ProductDTO {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: d.slug,
    sku: "",
    categoryId: d.categoryId ?? categories[0]?.id ?? "",
    name: d.name,
    summary: d.summary,
    description: d.description,
    specs: d.specs,
    price: d.price ?? 0,
    oldPrice: d.oldPrice,
    badge: "new",
    // The colour seen on the photo; add the other colours in the form.
    colors: [
      {
        id: "",
        key: slugKey(d.colorName.fr) || "couleur-1",
        name: d.colorName.fr || d.colorName.ar ? d.colorName : { fr: "", ar: "" },
        hex: d.swatchHex,
        tone: d.tone,
        price: null,
        oldPrice: null,
        images: [],
        // Stock is never invented: 0 until you fill it in.
        sizes: (d.sizes.length ? d.sizes : [36, 37, 38, 39, 40, 41]).map((size) => ({ size, stock: 0 })),
        position: 0,
      },
    ],
    active: true,
    position: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export default function NewProductEditor({ categories, ai }: { categories: CategoryDTO[]; ai: { ready: boolean; models: string[] } }) {
  const [draft, setDraft] = useState<ProductDTO | undefined>();
  const [version, setVersion] = useState(0);
  return (
    <div className="space-y-5">
      <AiProductAssistant
        ready={ai.ready}
        models={ai.models}
        onDraft={(d) => {
          setDraft(draftToProduct(d, categories));
          setVersion((v) => v + 1); // remount the form with the new values
        }}
      />
      {draft && (
        <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
          Brouillon IA chargé ci-dessous avec la couleur de la photo. <strong>Le stock est à 0</strong> : renseignez-le pour chaque taille (sinon « Épuisé »). Ajoutez les autres couleurs avec « + Ajouter une couleur ».
          {draft.price === 0 && " Indiquez aussi le prix."}
        </p>
      )}
      <ProductForm key={version} product={draft} categories={categories} />
    </div>
  );
}
