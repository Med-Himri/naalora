// Plain JSON shapes passed to components (never Mongoose documents).

export type L10n = { fr: string; ar: string };
export type Tone = "brown" | "pastel" | "dark" | "other";
export type Badge = "best" | "new" | "none";
export type OrderStatus = "nouveau" | "confirme" | "expedie" | "livre" | "annule";

export type CategoryDTO = {
  id: string;
  slug: string;
  name: L10n;
  intro: L10n;
  position: number;
  updatedAt: string;
};

export type ProductImageDTO = { id: string; url: string; publicId: string; alt: L10n; position: number };
export type SizeDTO = { size: number; stock: number };

export type ColorDTO = {
  id: string;
  /** Stable id used in URLs (?couleur=), carts and orders */
  key: string;
  name: L10n;
  hex: string;
  tone: Tone;
  /** null = product price */
  price: number | null;
  oldPrice: number | null;
  images: ProductImageDTO[];
  sizes: SizeDTO[];
  position: number;
};

export type ProductDTO = {
  id: string;
  slug: string;
  sku: string;
  categoryId: string;
  name: L10n;
  summary: L10n;
  description: L10n;
  specs: { material: L10n; lining: L10n; soleHeight: L10n; care: L10n };
  /** Base price (a colour can override it) */
  price: number;
  oldPrice: number | null;
  badge: Badge;
  /** At least one colour (old single-colour products are converted on read) */
  colors: ColorDTO[];
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type GuideDTO = {
  id: string;
  slug: string;
  title: L10n;
  excerpt: L10n;
  content: L10n;
  cover: { url: string; publicId: string; alt: L10n };
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Home hero picture. url "" = built-in illustration (public/hero/naalora-hero.webp). */
export type HeroDTO = { url: string; publicId: string; alt: L10n };

export type OrderItemDTO = { productId: string; slug: string; name: string; color: { key: string; name: string }; size: number; qty: number; unitPrice: number };

export type OrderDTO = {
  id: string;
  ref: string;
  status: OrderStatus;
  locale: "fr" | "ar";
  customer: { name: string; phone: string; city: string; address: string; note: string };
  items: OrderItemDTO[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};
