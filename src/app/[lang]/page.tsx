import { isLocale } from "@/lib/locales";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="container-page py-20">
      <h1 className="text-4xl">{t.home.title}</h1>
    </div>
  );
}
