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

export type ProductDTO = {
  id: string;
  slug: string;
  sku: string;
  categoryId: string;
  /** Model code: products with the same model are colours of each other ("" = whole category) */
  model: string;
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
  images: ProductImageDTO[];
  sizes: SizeDTO[];
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

export type OrderItemDTO = { productId: string; slug: string; name: string; size: number; qty: number; unitPrice: number };

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
