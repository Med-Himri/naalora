import Link from "next/link";
import { loadGuidesFresh } from "@/lib/data";
import { toggleGuidePublished } from "../../actions";

export const metadata = { title: "Guides" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default async function AdminGuidesPage() {
  const guides = await loadGuidesFresh();
  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Guides</h1>
        <Link href="/admin/guides/nouveau" className="btn btn-primary">+ Nouveau guide</Link>
      </div>
      <ul className="mt-6 space-y-3">
        {guides.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-[20px] bg-paper p-4 shadow-soft">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{g.title.fr}</p>
              <p className="text-sm text-muted">/{g.slug} · modifié le {dateFmt.format(new Date(g.updatedAt))}</p>
            </div>
            <form action={toggleGuidePublished}>
              <input type="hidden" name="id" value={g.id} />
              <input type="hidden" name="published" value={String(!g.published)} />
              <button className={`rounded-full px-4 py-2 text-sm font-medium ${g.published ? "bg-[#17834a]/10 text-[#17834a]" : "bg-sand"}`}>
                {g.published ? "Publié ✓" : "Brouillon — publier"}
              </button>
            </form>
            <Link href={`/admin/guides/${g.id}`} className="btn btn-outline !min-h-10 !py-2 text-sm">Modifier</Link>
          </li>
        ))}
        {guides.length === 0 && <li className="rounded-[20px] bg-paper p-6 text-muted shadow-soft">Aucun guide.</li>}
      </ul>
    </div>
  );
}
