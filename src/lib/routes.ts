import type { Locale } from "./locales";

/** Same slugs in both languages: only the /fr or /ar prefix changes. */
export const paths = {
  home: "",
  shop: "/boutique",
  category: (slug: string) => `/boutique/${slug}`,
  product: (slug: string) => `/produit/${slug}`,
  guides: "/guides",
  guide: (slug: string) => `/guides/${slug}`,
  sizeGuide: "/guide-des-tailles",
  faq: "/faq",
  about: "/a-propos",
  checkout: "/commande",
} as const;

export function href(lang: Locale, path: string = ""): string {
  return `/${lang}${path}`;
}

/** Swap the language prefix of a pathname: /fr/boutique → /ar/boutique */
export function switchLangPath(pathname: string, to: Locale): string {
  const rest = pathname.replace(/^\/(fr|ar)(?=\/|$)/, "");
  return `/${to}${rest}`;
}
