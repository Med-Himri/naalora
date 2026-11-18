import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/noto-kufi-arabic";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { defaultLocale, dirOf, isLocale, locales } from "@/lib/locales";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/i18n";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { themeScript } from "@/components/layout/ThemeToggle";
import InlineScript from "@/components/layout/InlineScript";
import DevStatus from "@/components/layout/DevStatus";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#17130f" },
  ],
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
  // suppressHydrationWarning: browser extensions (Grammarly…) add attributes to <html>/<body> before React loads.
  return (
    <html lang={lang} dir={dirOf(lang)} data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Sets light/dark before the first paint (no flash). */}
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {t.a11y.skip}
        </a>
        <CartProvider>
          <SiteHeader lang={lang} t={{ nav: t.nav, a11y: t.a11y }} />
          <main id="main" className="min-h-[60vh]">{children}</main>
          <SiteFooter lang={lang} />
          <DevStatus />
          <CartDrawer
            lang={lang}
            t={{
              ...t.cart,
              closeCart: t.a11y.closeCart,
              increase: t.a11y.increase,
              decrease: t.a11y.decrease,
              quantity: t.product.quantity,
              removeAria: t.a11y.remove,
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
