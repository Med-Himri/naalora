// Shared validation helpers (client-safe: no server imports).

/** Normalizes a Moroccan mobile/landline number to "+212XXXXXXXXX", or null if invalid.
 *  Accepts 06/07/05 + 8 digits, +212 / 00212 + 5|6|7 + 8 digits, with spaces, dots or dashes. */
export function normalizeMoroccanPhone(input: string): string | null {
  const s = String(input ?? "").replace(/[\s.\-()]/g, "");
  const m = s.match(/^(?:\+212|00212|0)([567]\d{8})$/);
  return m ? `+212${m[1]}` : null;
}

/** Trim, remove control characters, collapse spaces, cap length. */
export function cleanText(input: unknown, max: number): string {
  return String(input ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}

export const isObjectId = (v: unknown): v is string => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
