import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import type { CategoryDTO, L10n, ProductDTO, Tone } from "./types";

/**
 * TEST ONLY — demo mode (no MONGODB_URI).
 * Uses supplier photos from public/test-photos (git-ignored, never deployed).
 * On automatically when the photos are there; NAALORA_TEST_CATALOG=0 turns it off, =1 forces it on.
 * Prices of the new models are placeholders: set the real ones in the admin.
 */
const flag = process.env.NAALORA_TEST_CATALOG;
export const testPhotosDir = path.join(process.cwd(), "public", "test-photos");
export const testPhotosFound = existsSync(path.join(testPhotosDir, "platform-noir.jpg"));
export const testCatalogEnabled = flag === "1" || (flag !== "0" && testPhotosFound);

type Store = { categories: CategoryDTO[]; products: ProductDTO[] };

const now = new Date("2026-11-17T09:00:00Z").toISOString();
const photo = (name: string) => `/test-photos/${name}.jpg`;
const sizes = (from: number, to: number, stock = 10) => Array.from({ length: to - from + 1 }, (_, i) => ({ size: from + i, stock }));

type Model = {
  code: string;
  slug: string;
  categoryId: string;
  name: L10n;
  summary: L10n;
  description: L10n;
  specs: ProductDTO["specs"];
  price: number;
  oldPrice: number | null;
  badge: ProductDTO["badge"];
  sizes: { size: number; stock: number }[];
  colors: { key: string; name: L10n; hex: string; tone: Tone; photos: string[] }[];
};

function expand(m: Model, startPosition: number): ProductDTO[] {
  return m.colors.map((c, i) => ({
    id: `test-${m.code}-${c.key}`,
    slug: `${m.slug}-${c.key}`,
    sku: `NA-${m.code}-${c.key.slice(0, 3).toUpperCase()}`,
    categoryId: m.categoryId,
    model: m.slug,
    name: { fr: `${m.name.fr} ${c.name.fr}`, ar: `${m.name.ar} ${c.name.ar}` },
    summary: m.summary,
    description: m.description,
    specs: m.specs,
    colorName: c.name,
    swatchHex: c.hex,
    tone: c.tone,
    price: m.price,
    oldPrice: m.oldPrice,
    badge: i === 0 ? m.badge : "none",
    images: c.photos.map((p, k) => ({
      id: `test-img-${m.code}-${c.key}-${k}`,
      url: photo(p),
      publicId: "",
      alt: { fr: `${m.name.fr} ${c.name.fr}${k ? " — autres coloris" : ""}`, ar: `${m.name.ar} ${c.name.ar}${k ? " — ألوان أخرى" : ""}` },
      position: k,
    })),
    sizes: m.sizes.map((s) => ({ ...s })),
    active: true,
    position: startPosition + i,
    createdAt: now,
    updatedAt: now,
  }));
}

export function applyTestCatalog(store: Store): void {
  // 1) Real photos for the 6 platform slippers (same colours as the seed).
  for (const p of store.products) {
    const key = p.slug.replace("pantoufle-plateforme-", "");
    if (p.slug.startsWith("pantoufle-plateforme-")) {
      p.images = [`platform-${key}`, "platform-all"].map((name, k) => ({
        id: `test-img-${key}-${k}`,
        url: photo(name),
        publicId: "",
        alt: k ? { fr: "Pantoufles plateforme — toutes les couleurs", ar: "بلغات بنعل مرتفع — كل الألوان" } : p.images[0]?.alt ?? { fr: p.name.fr, ar: p.name.ar },
        position: k,
      }));
    }
  }

  const slippers = store.categories.find((c) => c.slug === "pantoufles");
  const boots: CategoryDTO = {
    id: "test-cat-bottes",
    slug: "bottes",
    name: { fr: "Bottes & bottines", ar: "أحذية طويلة وبوتات" },
    intro: {
      fr: "Bottines Chelsea et bottes à semelle crantée, faciles à enfiler et confortables pour l’hiver. Du 36 au 41, livrées partout au Maroc en 24 à 72 h avec paiement à la livraison.",
      ar: "بوتات تشيلسي وأحذية طويلة بنعل مسنن، سهلة الارتداء ومريحة لفصل الشتاء. من 36 إلى 41، تصلك لجميع مدن المغرب خلال 24 إلى 72 ساعة مع الدفع عند الاستلام.",
    },
    position: 2,
    updatedAt: now,
  };
  store.categories.push(boots);

  const bootSpecs: ProductDTO["specs"] = {
    material: { fr: "Similicuir (tige)", ar: "جلد صناعي (الجزء العلوي)" },
    lining: { fr: "Doublure textile", ar: "بطانة من القماش" },
    soleHeight: { fr: "4 cm, semelle crantée", ar: "4 سم، نعل مسنن" },
    care: { fr: "Chiffon humide, ne pas passer en machine.", ar: "قطعة قماش مبللة، لا للغسالة." },
  };

  const models: Model[] = [
    {
      code: "902",
      slug: "bottine-chelsea-boucle",
      categoryId: boots.id,
      name: { fr: "Bottine Chelsea à boucle", ar: "بوت تشيلسي بإبزيم" },
      summary: {
        fr: "Bottine Chelsea en similicuir avec élastiques latéraux et patte décorative à boucle. Semelle crantée de 4 cm. Du 36 au 41, livrée partout au Maroc en 24–72 h avec paiement à la livraison.",
        ar: "بوت تشيلسي من الجلد الصناعي بأشرطة مطاطية جانبية ولسان مزين بإبزيم. نعل مسنن بارتفاع 4 سم. من 36 إلى 41، يصلك لجميع مدن المغرب خلال 24–72 ساعة مع الدفع عند الاستلام.",
      },
      description: {
        fr: "Une bottine Chelsea facile à enfiler grâce à ses élastiques latéraux et à sa tirette arrière. La patte à boucle apporte une touche moderne.\n\nSa semelle crantée de 4 cm accroche bien et reste légère pour la ville.",
        ar: "بوت تشيلسي سهل الارتداء بفضل الأشرطة المطاطية الجانبية والمقبض الخلفي. اللسان المزين بالإبزيم يضيف لمسة عصرية.\n\nنعله المسنن بارتفاع 4 سم يثبت جيداً ويبقى خفيفاً للمدينة.",
      },
      specs: bootSpecs,
      price: 449,
      oldPrice: null,
      badge: "new",
      sizes: sizes(36, 41),
      colors: [
        { key: "taupe", name: { fr: "Taupe", ar: "رمادي بني" }, hex: "#6f5b52", tone: "brown", photos: ["902-taupe", "902-all"] },
        { key: "noir", name: { fr: "Noir", ar: "أسود" }, hex: "#1f1d1c", tone: "dark", photos: ["902-noir", "902-all"] },
        { key: "beige", name: { fr: "Beige", ar: "بيج" }, hex: "#c9a78a", tone: "brown", photos: ["902-beige", "902-all"] },
      ],
    },
    {
      code: "911",
      slug: "bottine-chelsea-classique",
      categoryId: boots.id,
      name: { fr: "Bottine Chelsea classique", ar: "بوت تشيلسي كلاسيكي" },
      summary: {
        fr: "Bottine Chelsea noire en similicuir, élastiques latéraux et deux tirettes. Semelle crantée de 4 cm. Du 36 au 40, livrée partout au Maroc en 24–72 h avec paiement à la livraison.",
        ar: "بوت تشيلسي أسود من الجلد الصناعي بأشرطة مطاطية جانبية ومقبضين. نعل مسنن بارتفاع 4 سم. من 36 إلى 40، يصلك لجميع مدن المغرب خلال 24–72 ساعة مع الدفع عند الاستلام.",
      },
      description: {
        fr: "Le modèle Chelsea indémodable : lignes simples, élastiques latéraux et tirettes avant et arrière pour l’enfiler en un geste.",
        ar: "موديل تشيلسي الذي لا يبطل: خطوط بسيطة، أشرطة مطاطية جانبية ومقبضان أمامي وخلفي لارتدائه بسهولة.",
      },
      specs: bootSpecs,
      price: 399,
      oldPrice: null,
      badge: "none",
      sizes: sizes(36, 40),
      colors: [{ key: "noir", name: { fr: "Noir", ar: "أسود" }, hex: "#1f1d1c", tone: "dark", photos: ["911-noir"] }],
    },
    {
      code: "948",
      slug: "botte-chaussette-tricot",
      categoryId: boots.id,
      name: { fr: "Botte chaussette en tricot", ar: "حذاء طويل بجورب محبوك" },
      summary: {
        fr: "Botte mi-mollet avec tige chaussette en tricot, bas en similicuir, ruban à anneau et zip intérieur. Semelle crantée de 4 cm. Du 36 au 41, livrée partout au Maroc en 24–72 h.",
        ar: "حذاء طويل إلى منتصف الساق بجزء علوي محبوك كالجورب، وأسفل من الجلد الصناعي، وشريط بحلقة وسحاب داخلي. نعل مسنن بارتفاع 4 سم. من 36 إلى 41.",
      },
      description: {
        fr: "La tige en tricot épouse la cheville, le bas en similicuir protège le pied. Le zip intérieur facilite l’enfilage.",
        ar: "الجزء المحبوك يلتف حول الكاحل، والأسفل من الجلد الصناعي يحمي القدم. السحاب الداخلي يسهل الارتداء.",
      },
      specs: { ...bootSpecs, material: { fr: "Tricot et similicuir", ar: "نسيج محبوك وجلد صناعي" } },
      price: 499,
      oldPrice: null,
      badge: "none",
      sizes: sizes(36, 41),
      colors: [{ key: "noir", name: { fr: "Noir", ar: "أسود" }, hex: "#1f1d1c", tone: "dark", photos: ["948-noir"] }],
    },
    {
      code: "JR26",
      slug: "pantoufle-tissee-franges",
      categoryId: slippers?.id ?? boots.id,
      name: { fr: "Pantoufle tissée à franges", ar: "بلغة منسوجة بأهداب" },
      summary: {
        fr: "Mule d’intérieur en suédine avec ruban tissé à motif zigzag et franges, doublure bouclette chaude. Du 36 au 41, livrée partout au Maroc en 24–72 h avec paiement à la livraison.",
        ar: "بلغة منزلية من القماش المخملي بشريط منسوج بنقش متعرج وأهداب، وبطانة دافئة. من 36 إلى 41، تصلك لجميع مدن المغرب خلال 24–72 ساعة مع الدفع عند الاستلام.",
      },
      description: {
        fr: "Une mule ouverte à l’arrière, facile à enfiler, avec un ruban tissé d’inspiration berbère et ses franges colorées.",
        ar: "بلغة مفتوحة من الخلف، سهلة الارتداء، بشريط منسوج مستوحى من الزخارف الأمازيغية وأهداب ملونة.",
      },
      specs: {
        material: { fr: "Suédine (tige)", ar: "قماش مخملي (الجزء العلوي)" },
        lining: { fr: "Bouclette chaude", ar: "بطانة صوفية دافئة" },
        soleHeight: { fr: "2 cm, souple", ar: "2 سم، مرن" },
        care: { fr: "Brosse douce à sec. Pas de machine.", ar: "فرشاة ناعمة على الجاف. لا للغسالة." },
      },
      price: 199,
      oldPrice: null,
      badge: "new",
      sizes: sizes(36, 41),
      colors: [
        { key: "camel", name: { fr: "Camel", ar: "كاميل" }, hex: "#b5803f", tone: "brown", photos: ["jr26-camel", "jr26-all"] },
        { key: "noir", name: { fr: "Noir", ar: "أسود" }, hex: "#1f1d1c", tone: "dark", photos: ["jr26-noir", "jr26-all"] },
        { key: "marron", name: { fr: "Marron", ar: "بني" }, hex: "#5e4030", tone: "brown", photos: ["jr26-marron", "jr26-all"] },
      ],
    },
  ];

  let position = store.products.length + 1;
  for (const m of models) {
    const items = expand(m, position);
    position += items.length;
    store.products.push(...items);
  }
}
