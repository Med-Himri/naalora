"use client";

import { deleteProductAction } from "@/app/admin/actions";

/** Trash button with a confirmation. Deleting also removes the product's photos from Cloudinary. */
export default function DeleteProductButton({ id, name, withLabel = false }: { id: string; name: string; withLabel?: boolean }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`Supprimer définitivement « ${name} » ?\n\nSes photos seront aussi supprimées. Les commandes passées ne changent pas.\nPour le cacher sans le supprimer, utilisez plutôt « Actif / Inactif ».`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        className={`inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-accent-dark transition hover:bg-accent-dark/10 ${withLabel ? "px-4 py-2" : "grid h-10 w-10 place-items-center"}`}
        aria-label={`Supprimer ${name}`}
        title="Supprimer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />
        </svg>
        {withLabel && "Supprimer le produit"}
      </button>
    </form>
  );
}
