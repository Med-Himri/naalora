import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import ImageManager from "@/components/admin/ImageManager";
import { Section } from "@/components/admin/fields";
import { loadCatalogFresh } from "@/lib/data";

export const metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { products, categories } = await loadCatalogFresh();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/admin/produits" className="text-sm text-muted hover:text-ink">← Produits</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl">{product.name.fr}</h1>
          {product.active && <Link href={`/fr/produit/${product.slug}`} target="_blank" className="text-sm font-medium underline underline-offset-4">Voir la fiche ↗</Link>}
        </div>
        {sp.created && <p role="status" className="mt-3 rounded-2xl bg-[#17834a]/10 px-4 py-3 text-sm font-medium text-[#17834a]">Produit créé. Ajoutez maintenant les images.</p>}
      </div>
      <Section title="Images">
        <ImageManager productId={product.id} images={product.images} defaultAlt={product.name} />
      </Section>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
