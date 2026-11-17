import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { loadCatalogFresh } from "@/lib/data";

export const metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  const { categories } = await loadCatalogFresh();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/produits" className="text-sm text-muted hover:text-ink">← Produits</Link>
      <h1 className="mt-2 text-4xl">Nouveau produit</h1>
      <p className="mt-2 text-sm text-muted">Les images s’ajoutent après la création.</p>
      <div className="mt-6">
        {categories.length ? <ProductForm categories={categories} /> : <p className="rounded-2xl bg-sand p-4">Créez d’abord une catégorie.</p>}
      </div>
    </div>
  );
}
