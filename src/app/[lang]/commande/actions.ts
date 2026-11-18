"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/data";
import { CITY_VALUES, getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/locales";
import { createOrder, OrderProblemError, type OrderLineInput } from "@/lib/orders";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { fmt } from "@/lib/format";
import { cleanText, normalizeMoroccanPhone } from "@/lib/validation";

type Field = "name" | "phone" | "city" | "address";

export type CheckoutState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fields?: Partial<Record<Field, string>>;
      /** Lines whose quantity must be lowered (available stock), or removed (0). */
      adjust?: { productId: string; colorKey: string; size: number; available: number }[];
    }
  | { status: "success"; ref: string; total: number; subtotal: number; shipping: number };

const MAX_LINES = 20;

function parseLines(raw: unknown): OrderLineInput[] | null {
  let data: unknown;
  try {
    data = JSON.parse(String(raw ?? "[]"));
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0 || data.length > MAX_LINES) return null;
  const merged = new Map<string, OrderLineInput>();
  for (const x of data) {
    if (!x || typeof x !== "object") return null;
    const productId = typeof x.productId === "string" ? x.productId.slice(0, 64) : "";
    const colorKey = typeof x.colorKey === "string" ? x.colorKey.slice(0, 60) : "";
    const size = Number(x.size);
    const qty = Number(x.qty);
    if (!productId || !colorKey || !Number.isInteger(size) || size < 15 || size > 50 || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) return null;
    const key = `${productId}:${colorKey}:${size}`;
    const prev = merged.get(key);
    merged.set(key, { productId, colorKey, size, qty: Math.min(MAX_QTY_PER_LINE, (prev?.qty ?? 0) + qty) });
  }
  return [...merged.values()];
}

export async function placeOrder(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const rawLang = form.get("locale");
  const lang: Locale = isLocale(rawLang) ? rawLang : "fr";
  const t = getDictionary(lang).checkout.errors;

  // Honeypot: real people never fill this hidden field.
  if (cleanText(form.get("website"), 200)) return { status: "error", message: t.generic };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!rateLimit(`order:${ip}`, 6, 10 * 60 * 1000)) return { status: "error", message: t.rate };

  const name = cleanText(form.get("name"), 80);
  const phone = normalizeMoroccanPhone(cleanText(form.get("phone"), 30));
  const city = cleanText(form.get("city"), 60);
  const address = cleanText(form.get("address"), 300);
  const note = cleanText(form.get("note"), 300);

  const fields: Partial<Record<Field, string>> = {};
  if (name.length < 2) fields.name = t.name;
  if (!phone) fields.phone = t.phone;
  if (!CITY_VALUES.includes(city)) fields.city = t.city;
  if (address.length < 8) fields.address = t.address;
  if (Object.keys(fields).length) return { status: "error", fields };

  const lines = parseLines(form.get("items"));
  if (!lines) return { status: "error", message: t.cart };

  try {
    const { ref, built } = await createOrder(lines, { name, phone: phone!, city, address, note }, lang);
    revalidateTag(TAGS.catalog, "max"); // stock changed
    return { status: "success", ref, total: built.total, subtotal: built.subtotal, shipping: built.shipping };
  } catch (err) {
    if (err instanceof OrderProblemError) {
      const gone = err.problems.filter((p) => p.reason === "gone");
      const stock = err.problems.filter((p) => p.reason === "stock");
      const sizeWord = lang === "ar" ? "المقاس" : "taille";
      const list = (ps: typeof err.problems) => ps.map((p) => `${p.name} (${sizeWord} ${p.size})`).join(", ");
      const message = [gone.length ? fmt(t.productGone, { items: list(gone) }) : "", stock.length ? fmt(t.stock, { items: list(stock) }) : ""]
        .filter(Boolean)
        .join(" ");
      return { status: "error", message, adjust: err.problems.map((p) => ({ productId: p.productId, colorKey: p.colorKey, size: p.size, available: p.available })) };
    }
    console.error("[checkout] order failed", err);
    return { status: "error", message: t.generic };
  }
}
