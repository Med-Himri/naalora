"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type Texts = { title: string; text: string; shop: string; home: string };

export default function NotFoundContent({ texts }: { texts: { fr: Texts; ar: Texts } }) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang === "ar" ? "ar" : "fr";
  const t = texts[lang];
  return (
    <main id="main" className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-7xl text-accent" aria-hidden="true">404</p>
      <h1 className="mt-4 max-w-xl text-3xl sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-muted">{t.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${lang}/boutique`} className="btn btn-primary">{t.shop}</Link>
        <Link href={`/${lang}`} className="btn btn-outline">{t.home}</Link>
      </div>
    </main>
  );
}
