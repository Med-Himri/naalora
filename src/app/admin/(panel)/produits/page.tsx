import Image from "next/image";
import Link from "next/link";
import { loadCatalogFresh, totalStock } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { toggleProductActive } from "../../actions";

export const metadata = { title: "Produits" };

export default async function AdminProductsPage() {
  const { products, categories } = await loadCatalogFresh();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Produits</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/produits/nouveau#assistant-ia" className="btn btn-accent">✨ Ajouter avec l’IA</Link>
          <Link href="/admin/produits/nouveau" className="btn btn-outline">+ Nouveau produit</Link>
        </div>
      </div>
      {categories.length === 0 && (
        <div className="mt-4 rounded-2xl bg-sand p-4 text-sm">
          <p className="font-semibold">La base de données est vide.</p>
          <p className="mt-1">
            Pour charger la catégorie « Pantoufles », les 6 pantoufles et les 3 guides d’exemple, lancez <code className="font-semibold">npm run seed</code> dans le dossier du projet (Node.js 22.18 ou plus récent), puis rechargez cette page.
            Ou créez une catégorie dans l’onglet <Link href="/admin/categories" className="underline underline-offset-4">Catégories</Link>.
          </p>
        </div>
      )}
      <ul className="mt-6 space-y-3">
        {products.map((p) => {
          const stock = totalStock(p);
          const out = p.sizes.filter((s) => s.stock <= 0).map((s) => s.size);
          return (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 rounded-[20px] bg-paper p-3 shadow-soft ${p.active ? "" : "opacity-60"}`}>
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  <span className="me-2 inline-block h-3 w-3 rounded-full align-middle ring-1 ring-ink/15" style={{ background: p.swatchHex }} />
                  {p.name.fr}
                </p>
                <p className="text-sm text-muted">
                  {categories.find((c) => c.id === p.categoryId)?.name.fr ?? "—"} · {formatPrice(p.price, "fr")} · Stock {stock}
                  {out.length > 0 && <span className="text-accent-dark"> · Épuisé : {out.join(", ")}</span>}
                </p>
                <p className="text-xs text-muted">/{p.slug} · {p.images.length} image(s)</p>
              </div>
              <form action={toggleProductActive}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(!p.active)} />
                <button className={`rounded-full px-4 py-2 text-sm font-medium ${p.active ? "bg-success/10 text-success" : "bg-sand text-ink"}`}>
                  {p.active ? "Actif ✓" : "Inactif"}
                </button>
              </form>
              <Link href={`/admin/produits/${p.id}`} className="btn btn-outline !min-h-10 !py-2 text-sm">Modifier</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
