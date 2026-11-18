import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import ImageManager from "@/components/admin/ImageManager";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
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
        {sp.created && <p role="status" className="mt-3 rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">Produit créé. Ajoutez maintenant les images.</p>}
      </div>
      {product.colors.map((c) => (
        <Section key={c.id} title={`Photos — ${c.name.fr}`}>
          <div className="-mt-2 flex items-center gap-2 text-sm text-muted">
            <span className="h-4 w-4 rounded-full ring-1 ring-ink/20" style={{ background: c.hex }} aria-hidden="true" />
            Ces photos s’affichent quand le client choisit « {c.name.fr} ».
          </div>
          <ImageManager
            productId={product.id}
            colorKey={c.key}
            images={c.images}
            defaultAlt={{ fr: `${product.name.fr} ${c.name.fr}`, ar: `${product.name.ar} ${c.name.ar}` }}
          />
        </Section>
      ))}
      <ProductForm product={product} categories={categories} />
      <div className="flex justify-end border-t border-line pt-4">
        <DeleteProductButton id={product.id} name={product.name.fr} withLabel />
      </div>
    </div>
  );
}
