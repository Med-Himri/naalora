import "server-only";
import { cleanText } from "../validation";
import type { Badge, L10n, Tone } from "../types";

/** Every admin input goes through these helpers: whitelisted fields, typed and length-capped. */

export type FieldErrors = Record<string, string>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const TONES: Tone[] = ["brown", "pastel", "dark", "other"];
const BADGES: Badge[] = ["best", "new", "none"];

export function str(fd: FormData, name: string, max = 200): string {
  return cleanText(fd.get(name), max);
}

/** Multi-line text: keeps line breaks (Markdown, descriptions). */
export function longText(fd: FormData, name: string, max = 20000): string {
  return String(fd.get(name) ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

export function l10n(fd: FormData, base: string, max = 200, multiline = false): L10n {
  const read = multiline ? (n: string) => longText(fd, n, max) : (n: string) => str(fd, n, max);
  return { fr: read(`${base}_fr`), ar: read(`${base}_ar`) };
}

export function int(fd: FormData, name: string, min: number, max: number): number | null {
  const raw = String(fd.get(name) ?? "").trim();
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : NaN;
}

export function bool(fd: FormData, name: string): boolean {
  const v = fd.get(name);
  return v === "on" || v === "true" || v === "1";
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function checkSlug(raw: string, fallback: string, errors: FieldErrors): string {
  const slug = raw ? raw.toLowerCase() : slugify(fallback);
  if (!slug || !SLUG_RE.test(slug) || slug.length > 80) errors.slug = "Slug invalide : lettres minuscules, chiffres et tirets (ex. pantoufle-plateforme-camel).";
  return slug;
}

/* ---------- Product ---------- */

export type ProductInput = {
  slug: string;
  sku: string;
  categoryId: string;
  name: L10n;
  summary: L10n;
  description: L10n;
  specs: { material: L10n; lining: L10n; soleHeight: L10n; care: L10n };
  colorName: L10n;
  swatchHex: string;
  tone: Tone;
  price: number;
  oldPrice: number | null;
  badge: Badge;
  sizes: { size: number; stock: number }[];
  active: boolean;
  position: number;
};

export function parseProduct(fd: FormData): { data: ProductInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = l10n(fd, "name", 120);
  if (!name.fr) errors.name_fr = "Nom (FR) obligatoire.";
  if (!name.ar) errors.name_ar = "Nom (AR) obligatoire.";

  const price = int(fd, "price", 0, 100000);
  if (price === null || Number.isNaN(price)) errors.price = "Prix invalide (nombre entier en MAD).";
  const oldPrice = int(fd, "oldPrice", 0, 100000);
  if (Number.isNaN(oldPrice)) errors.oldPrice = "Ancien prix invalide.";
  else if (oldPrice !== null && price !== null && !Number.isNaN(price) && oldPrice <= price) errors.oldPrice = "L’ancien prix doit être supérieur au prix.";

  const swatchHex = str(fd, "swatchHex", 7);
  if (!HEX_RE.test(swatchHex)) errors.swatchHex = "Couleur invalide (#rrggbb).";
  const tone = str(fd, "tone", 10) as Tone;
  if (!TONES.includes(tone)) errors.tone = "Teinte invalide.";
  const badge = str(fd, "badge", 10) as Badge;
  if (!BADGES.includes(badge)) errors.badge = "Badge invalide.";
  const categoryId = str(fd, "categoryId", 64);
  if (!categoryId) errors.categoryId = "Choisissez une catégorie.";
  const position = int(fd, "position", 0, 10000);

  // Sizes: parallel lists "size" / "stock"
  const sizesRaw = fd.getAll("size").map((v) => String(v).trim());
  const stocksRaw = fd.getAll("stock").map((v) => String(v).trim());
  const sizes: { size: number; stock: number }[] = [];
  if (sizesRaw.length > 30) errors.sizes = "30 tailles maximum.";
  sizesRaw.forEach((s, i) => {
    if (s === "" && (stocksRaw[i] ?? "") === "") return; // empty row
    const size = Number(s);
    const stock = Number(stocksRaw[i] ?? "0");
    if (!Number.isInteger(size) || size < 15 || size > 50) errors.sizes = `Taille invalide : « ${s} » (entier entre 15 et 50).`;
    else if (!Number.isInteger(stock) || stock < 0 || stock > 100000) errors.sizes = `Stock invalide pour la taille ${size}.`;
    else if (sizes.some((x) => x.size === size)) errors.sizes = `La taille ${size} apparaît deux fois.`;
    else sizes.push({ size, stock });
  });
  if (!sizes.length && !errors.sizes) errors.sizes = "Ajoutez au moins une taille.";
  sizes.sort((a, b) => a.size - b.size);

  const data: ProductInput = {
    slug: checkSlug(str(fd, "slug", 80), name.fr, errors),
    sku: str(fd, "sku", 40),
    categoryId,
    name,
    summary: l10n(fd, "summary", 600, true),
    description: l10n(fd, "description", 5000, true),
    specs: {
      material: l10n(fd, "material", 120),
      lining: l10n(fd, "lining", 120),
      soleHeight: l10n(fd, "soleHeight", 120),
      care: l10n(fd, "care", 300),
    },
    colorName: l10n(fd, "colorName", 60),
    swatchHex: swatchHex.toLowerCase(),
    tone,
    price: price ?? 0,
    oldPrice: oldPrice === null || Number.isNaN(oldPrice) ? null : oldPrice,
    badge,
    sizes,
    active: bool(fd, "active"),
    position: position === null || Number.isNaN(position) ? 0 : position,
  };
  return { data, errors };
}

/* ---------- Category ---------- */

export type CategoryInput = { slug: string; name: L10n; intro: L10n };

export function parseCategory(fd: FormData): { data: CategoryInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = l10n(fd, "name", 60);
  if (!name.fr) errors.name_fr = "Nom (FR) obligatoire.";
  if (!name.ar) errors.name_ar = "Nom (AR) obligatoire.";
  const intro = l10n(fd, "intro", 600, true);
  return { data: { slug: checkSlug(str(fd, "slug", 80), name.fr, errors), name, intro }, errors };
}

/* ---------- Guide ---------- */

export type GuideInput = { slug: string; title: L10n; excerpt: L10n; content: L10n; coverAlt: L10n; published: boolean };

export function parseGuide(fd: FormData): { data: GuideInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const title = l10n(fd, "title", 140);
  if (!title.fr) errors.title_fr = "Titre (FR) obligatoire.";
  if (!title.ar) errors.title_ar = "Titre (AR) obligatoire.";
  return {
    data: {
      slug: checkSlug(str(fd, "slug", 80), title.fr, errors),
      title,
      excerpt: l10n(fd, "excerpt", 300, true),
      content: l10n(fd, "content", 30000, true),
      coverAlt: l10n(fd, "coverAlt", 160),
      published: bool(fd, "published"),
    },
    errors,
  };
}
