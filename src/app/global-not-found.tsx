import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/noto-kufi-arabic";
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "404 — Page introuvable | الصفحة غير موجودة | Naalora",
  robots: { index: false, follow: true },
};

// Served for any URL that matches no route. The language is unknown here,
// so the page is shown in both French and Arabic.
export default function GlobalNotFound() {
  const fr = getDictionary("fr").notFound;
  const ar = getDictionary("ar").notFound;
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-dvh" suppressHydrationWarning>
        <main id="main" className="container-page flex min-h-dvh flex-col items-center justify-center py-16 text-center">
          <Link href="/fr" aria-label="Naalora">
            <Image src="/naalora-logo.svg" alt="Naalora" width={180} height={44} preload />
          </Link>
          <p className="font-display mt-10 text-7xl text-accent" aria-hidden="true">404</p>
          <div className="mt-8 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
            <section className="card p-6" lang="fr" dir="ltr">
              <h1 className="text-2xl">{fr.title}</h1>
              <p className="mt-2 text-muted">{fr.text}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/fr/boutique" className="btn btn-primary">{fr.shop}</Link>
                <Link href="/fr" className="btn btn-outline">{fr.home}</Link>
              </div>
            </section>
            <section className="card p-6" lang="ar" dir="rtl" style={{ fontFamily: "var(--font-arabic)" }}>
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-arabic)" }}>{ar.title}</h2>
              <p className="mt-2 text-muted">{ar.text}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/ar/boutique" className="btn btn-primary">{ar.shop}</Link>
                <Link href="/ar" className="btn btn-outline">{ar.home}</Link>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
