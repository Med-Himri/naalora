"use client";

import { useState } from "react";
import AiProductAssistant from "./AiProductAssistant";
import ProductForm from "./ProductForm";
import type { AiDraftResult } from "@/app/admin/actions";
import type { CategoryDTO, ProductDTO } from "@/lib/types";

type Draft = Extract<AiDraftResult, { ok: true }>["draft"];

/** Turns an AI draft into initial form values (a product that is not saved yet: id = ""). */
function draftToProduct(d: Draft, categories: CategoryDTO[]): ProductDTO {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: d.slug,
    sku: "",
    categoryId: d.categoryId ?? categories[0]?.id ?? "",
    model: d.model,
    name: d.name,
    summary: d.summary,
    description: d.description,
    specs: d.specs,
    colorName: d.colorName,
    swatchHex: d.swatchHex,
    tone: d.tone,
    price: d.price ?? 0,
    oldPrice: d.oldPrice,
    badge: "new",
    images: [],
    // Stock is never invented: 0 until you fill it in.
    sizes: (d.sizes.length ? d.sizes : [36, 37, 38, 39, 40, 41]).map((size) => ({ size, stock: 0 })),
    active: true,
    position: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export default function NewProductEditor({ categories }: { categories: CategoryDTO[] }) {
  const [draft, setDraft] = useState<ProductDTO | undefined>();
  const [version, setVersion] = useState(0);
  return (
    <div className="space-y-5">
      <AiProductAssistant
        onDraft={(d) => {
          setDraft(draftToProduct(d, categories));
          setVersion((v) => v + 1); // remount the form with the new values
        }}
      />
      {draft && (
        <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
          Brouillon IA chargé ci-dessous. <strong>Le stock est à 0</strong> : renseignez-le pour chaque taille (sinon la taille s’affiche « Épuisé »).
          {draft.price === 0 && " Indiquez aussi le prix."}
        </p>
      )}
      <ProductForm key={version} product={draft} categories={categories} />
    </div>
  );
}
