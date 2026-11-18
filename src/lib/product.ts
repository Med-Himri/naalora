// Product + colour helpers (client-safe: no server imports).
import type { ColorDTO, ProductDTO } from "./types";

/** "Bleu Ciel" → "bleu-ciel" (colour keys and slugs). */
export function slugKey(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const priceOf = (p: ProductDTO, c?: ColorDTO | null) => c?.price ?? p.price;
export const oldPriceOf = (p: ProductDTO, c?: ColorDTO | null) => {
  const old = c?.price !== null && c?.price !== undefined ? c.oldPrice : (c?.oldPrice ?? p.oldPrice);
  const price = priceOf(p, c);
  return old && old > price ? old : null;
};

export const colorStock = (c: ColorDTO) => c.sizes.reduce((n, s) => n + Math.max(0, s.stock), 0);
export const totalStock = (p: ProductDTO) => p.colors.reduce((n, c) => n + colorStock(c), 0);

export const colorByKey = (p: ProductDTO, key: string | null | undefined) => p.colors.find((c) => c.key === key) ?? null;

/** Colour shown by default: the first one that is in stock (or the first one). */
export const defaultColor = (p: ProductDTO): ColorDTO => p.colors.find((c) => colorStock(c) > 0) ?? p.colors[0];

/** Lowest price among the colours. */
export const minPriceOf = (p: ProductDTO) => Math.min(...p.colors.map((c) => priceOf(p, c)));

/** Every size offered by any colour, sorted. */
export const allSizes = (p: ProductDTO) => [...new Set(p.colors.flatMap((c) => c.sizes.map((s) => s.size)))].sort((a, b) => a - b);

/** First photo of the colour (falls back to any colour that has one). */
export const coverImage = (p: ProductDTO, c?: ColorDTO | null) => (c ?? defaultColor(p))?.images[0] ?? p.colors.find((x) => x.images.length)?.images[0] ?? null;
