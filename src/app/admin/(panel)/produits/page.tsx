import Image from "next/image";
import Link from "next/link";
import { loadCatalogFresh, totalStock } from "@/lib/data";
import { colorStock, coverImage } from "@/lib/product";
import { formatPrice } from "@/lib/format";
import { toggleProductActive } from "../../actions";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Produits" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const [{ products, categories }, sp] = await Promise.all([loadCatalogFresh(), searchParams]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Produits</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/produits/nouveau#assistant-ia" className="btn btn-accent">✨ Ajouter avec l’IA</Link>
          <Link href="/admin/produits/nouveau" className="btn btn-outline">+ Nouveau produit</Link>
        </div>
      </div>
      {sp.deleted && <p role="status" className="mt-4 rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">Produit supprimé.</p>}
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
          const cover = coverImage(p);
          const photos = p.colors.reduce((n, c) => n + c.images.length, 0);
          const outColors = p.colors.filter((c) => colorStock(c) <= 0).map((c) => c.name.fr);
          return (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 rounded-[20px] bg-paper p-3 shadow-soft ${p.active ? "" : "opacity-60"}`}>
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {cover && <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name.fr}</p>
                <ul className="mt-1 flex flex-wrap items-center gap-1.5" aria-label="Couleurs">
                  {p.colors.map((c) => (
                    <li key={c.key} title={`${c.name.fr} · stock ${colorStock(c)}`} className={`flex items-center gap-1 rounded-full bg-sand/70 py-0.5 pe-2 ps-0.5 text-xs ${colorStock(c) <= 0 ? "opacity-50" : ""}`}>
                      <span className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/20" style={{ background: c.hex }} />
                      {c.name.fr} · {colorStock(c)}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted">
                  {categories.find((c) => c.id === p.categoryId)?.name.fr ?? "—"} · {formatPrice(p.price, "fr")} · Stock total {stock}
                  {outColors.length > 0 && <span className="text-accent-dark"> · Épuisé : {outColors.join(", ")}</span>}
                </p>
                <p className="text-xs text-muted">/{p.slug} · {p.colors.length} couleur(s) · {photos} photo(s)</p>
              </div>
              <form action={toggleProductActive}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(!p.active)} />
                <button className={`rounded-full px-4 py-2 text-sm font-medium ${p.active ? "bg-success/10 text-success" : "bg-sand text-ink"}`}>
                  {p.active ? "Actif ✓" : "Inactif"}
                </button>
              </form>
              <Link href={`/admin/produits/${p.id}`} className="btn btn-outline !min-h-10 !py-2 text-sm">Modifier</Link>
              <DeleteProductButton id={p.id} name={p.name.fr} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
