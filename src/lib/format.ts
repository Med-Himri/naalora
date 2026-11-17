// Client-safe formatting helpers (no server imports here).
export type Lang = "fr" | "ar";

/** Replace {name} placeholders. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** "349 MAD" (fr) / "349 درهم" (ar) */
export function formatPrice(amount: number, lang: Lang): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(amount).replace(/ | /g, " ");
  return lang === "ar" ? `${n} درهم` : `${n} MAD`;
}

export function formatDate(date: string | Date, lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  }).format(d);
}
