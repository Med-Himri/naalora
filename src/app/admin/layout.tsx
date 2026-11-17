import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/noto-kufi-arabic";
import "../globals.css";
import type { Metadata } from "next";

// Admin is always rendered per request (auth cookie), never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin — Naalora", template: "%s — Admin Naalora" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
