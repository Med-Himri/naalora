import CategoryForm from "@/components/admin/CategoryForm";
import { Section } from "@/components/admin/fields";
import { loadCatalogFresh } from "@/lib/data";
import { moveCategoryAction } from "../../actions";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const { categories, products } = await loadCatalogFresh();
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl">Catégories</h1>
      <p className="mt-2 text-sm text-muted">Une catégorie n’apparaît sur le site que si elle contient au moins un produit actif.</p>
      <ol className="mt-6 space-y-3">
        {categories.map((c, i) => (
          <li key={c.id}>
            <details className="group rounded-[20px] bg-paper shadow-soft [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-sand text-sm font-semibold">{i + 1}</span>
                <span className="font-semibold">{c.name.fr}</span>
                <span className="text-sm text-muted" dir="rtl">{c.name.ar}</span>
                <span className="text-sm text-muted">/{c.slug} · {products.filter((p) => p.categoryId === c.id).length} produit(s)</span>
                <span className="ms-auto flex gap-1.5">
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="-1" />
                    <button className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" disabled={i === 0} aria-label={`Monter ${c.name.fr}`}>↑</button>
                  </form>
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="1" />
                    <button className="rounded-full bg-sand px-3 py-1.5 text-sm disabled:opacity-40" disabled={i === categories.length - 1} aria-label={`Descendre ${c.name.fr}`}>↓</button>
                  </form>
                </span>
              </summary>
              <div className="border-t border-line p-4"><CategoryForm category={c} /></div>
            </details>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <Section title="Nouvelle catégorie"><CategoryForm /></Section>
      </div>
    </div>
  );
}
