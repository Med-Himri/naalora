export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const hreflang: Record<Locale, string> = { fr: "fr-MA", ar: "ar-MA" };
export const ogLocale: Record<Locale, string> = { fr: "fr_MA", ar: "ar_MA" };

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "ar";
}

export function dirOf(lang: Locale): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}
