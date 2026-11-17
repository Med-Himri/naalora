import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/noto-kufi-arabic";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { defaultLocale, dirOf, isLocale, locales } from "@/lib/locales";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#f7f0e6",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.meta.homeTitle, template: "%s | Naalora" },
    description: t.meta.siteDescription,
    applicationName: SITE.name,
    formatDetection: { telephone: false },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : defaultLocale;
  const t = getDictionary(lang);
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {t.a11y.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
