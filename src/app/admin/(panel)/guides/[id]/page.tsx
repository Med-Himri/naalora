import Link from "next/link";
import { notFound } from "next/navigation";
import GuideForm from "@/components/admin/GuideForm";
import CoverUploader from "@/components/admin/CoverUploader";
import { Section } from "@/components/admin/fields";
import { loadGuidesFresh } from "@/lib/data";

export const metadata = { title: "Modifier le guide" };

export default async function EditGuidePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const guide = (await loadGuidesFresh()).find((g) => g.id === id);
  if (!guide) notFound();
  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <Link href="/admin/guides" className="text-sm text-muted hover:text-ink">← Guides</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl">{guide.title.fr}</h1>
          {guide.published && <Link href={`/fr/guides/${guide.slug}`} target="_blank" className="text-sm font-medium underline underline-offset-4">Voir l’article ↗</Link>}
        </div>
        {sp.created && <p role="status" className="mt-3 rounded-2xl bg-[#17834a]/10 px-4 py-3 text-sm font-medium text-[#17834a]">Guide créé.</p>}
      </div>
      <Section title="Image de couverture"><CoverUploader guideId={guide.id} url={guide.cover.url} /></Section>
      <GuideForm guide={guide} />
    </div>
  );
}
