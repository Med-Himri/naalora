import Link from "next/link";
import GuideForm from "@/components/admin/GuideForm";

export const metadata = { title: "Nouveau guide" };

export default function NewGuidePage() {
  return (
    <div className="max-w-5xl">
      <Link href="/admin/guides" className="text-sm text-muted hover:text-ink">← Guides</Link>
      <h1 className="mt-2 text-4xl">Nouveau guide</h1>
      <div className="mt-6"><GuideForm /></div>
    </div>
  );
}
