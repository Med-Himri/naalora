/**
 * Single source of truth for business facts.
 * Pages, FAQ, About, JSON-LD, the Merchant feed and llms.txt all read from here,
 * so the same facts appear everywhere.
 */
export const SITE = {
  name: "Naalora",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://naalora.com").replace(/\/$/, ""),
  city: { fr: "Casablanca", ar: "الدار البيضاء" },
  country: "MA",
  currency: "MAD",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000").replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@naalora.com",
  shippingFee: 35,
  freeShippingFrom: 500,
  deliveryDays: { min: 1, max: 3 },
  deliveryHours: { min: 24, max: 72 },
  exchangeDays: 7,
  /** EU size → foot length in cm */
  sizeChart: [
    { size: 36, cm: 22.5 },
    { size: 37, cm: 23.5 },
    { size: 38, cm: 24 },
    { size: 39, cm: 25 },
    { size: 40, cm: 25.5 },
    { size: 41, cm: 26.5 },
  ],
  /** Date the FAQ / policies were last reviewed (shown on the pages) */
  contentUpdatedAt: "2026-11-17",
} as const;

/** "+212 6 00 00 00 00" */
export function displayPhone(num: string = SITE.whatsapp): string {
  const local = num.startsWith("212") ? num.slice(3) : num;
  return `+212 ${local.slice(0, 1)} ${local.slice(1).replace(/(\d{2})(?=\d)/g, "$1 ")}`.trim();
}

export function whatsappLink(text?: string, num: string = SITE.whatsapp): string {
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function absoluteUrl(path = ""): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
