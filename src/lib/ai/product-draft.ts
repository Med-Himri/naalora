import "server-only";
import { SITE } from "../site";
import { slugify } from "../admin/forms";
import { generateJson, type ChatMessage } from "./groq";
import type { Tone, L10n } from "../types";

/** What the AI fills in. Everything is reviewed in the product form before saving. */
export type ProductDraft = {
  name: L10n;
  slug: string;
  model: string;
  categorySlug: string | null;
  colorName: L10n;
  swatchHex: string;
  tone: Tone;
  summary: L10n;
  description: L10n;
  specs: { material: L10n; lining: L10n; soleHeight: L10n; care: L10n };
  imageAlt: L10n;
  price: number | null;
  oldPrice: number | null;
  sizes: number[];
};

const TONES: Tone[] = ["brown", "pastel", "dark", "other"];
const h = SITE.deliveryHours;

function systemPrompt(categories: { slug: string; name: string }[], shippingSentence: string): string {
  return `Tu es le rédacteur e-commerce de ${SITE.name}, boutique de chaussures en ligne basée à ${SITE.city.fr} (Maroc).
Tu rédiges la fiche d’UN produit en français ET en arabe standard simple, compréhensible au Maroc. Un produit peut exister en plusieurs couleurs : le nom et le slug ne contiennent JAMAIS la couleur ; la couleur de la photo va dans color_fr / color_ar.

Faits de la boutique (à utiliser tels quels, ne pas en inventer d’autres) :
- Livraison partout au Maroc en ${h.min}–${h.max} h. ${shippingSentence}
- Paiement en espèces à la livraison. Échange de taille gratuit ${SITE.exchangeDays} jours.

Règles :
- Style : chaleureux, premium, factuel. Phrases courtes. Pas d’emoji, pas de superlatifs vides.
- N’écris JAMAIS de nom de marque, de logo ou de marque déposée vus sur la photo ou dans la note (ex. : UGG, Dior, Nike…). Décris le style avec des mots génériques.
- N’invente pas de matière précise si elle n’est pas visible ou indiquée : reste générique (ex. « similicuir », « suédine », « textile »).
- Prix et tailles : uniquement s’ils sont dans la note, sinon null. Ne devine jamais un prix.
- summary : 2 à 3 phrases factuelles valables pour toutes les couleurs (type, matière, détail clé, semelle, tailles si connues ; pas la couleur), la dernière mentionne la livraison ${h.min}–${h.max} h partout au Maroc et le paiement à la livraison.
- description : 2 courts paragraphes séparés par une ligne vide.
- name : « <type> <détail> », SANS la couleur, ex. « Bottine Chelsea à boucle ». Max 60 caractères.
- slug : français, minuscules, tirets, sans accents, SANS la couleur (ex. « bottine-chelsea-boucle »).
- model : identique au slug.
- swatch_hex : la couleur réelle du produit estimée sur la photo (#rrggbb), pas une couleur nommée générique.
- tone : "brown" (bruns, beiges, camel), "pastel" (rose, bleu ciel…), "dark" (noir, gris foncé, marine) ou "other".
- category_slug : un de ${JSON.stringify(categories.map((c) => c.slug))} ou null si aucun ne convient.
  Catégories : ${categories.map((c) => `${c.slug} = ${c.name}`).join(" ; ") || "aucune"}.

Réponds UNIQUEMENT avec un objet JSON ayant exactement ces clés :
{"name_fr","name_ar","slug","model","category_slug","color_fr","color_ar","swatch_hex","tone",
"summary_fr","summary_ar","description_fr","description_ar",
"material_fr","material_ar","lining_fr","lining_ar","sole_fr","sole_ar","care_fr","care_ar",
"alt_fr","alt_ar","price","old_price","sizes"}
(price/old_price : nombre en MAD ou null ; sizes : tableau d’entiers EU ou [] ; alt : description courte de la photo).`;
}

/* ---------- strict parsing ---------- */

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";
const l10n = (o: Record<string, unknown>, base: string, max: number): L10n => ({ fr: text(o[`${base}_fr`], max), ar: text(o[`${base}_ar`], max) });
const money = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : NaN;
  return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n) : null;
};

function parseDraft(data: unknown, categorySlugs: string[]): ProductDraft {
  if (!data || typeof data !== "object") throw new Error("JSON invalide");
  const o = data as Record<string, unknown>;
  const name = l10n(o, "name", 80);
  if (!name.fr || !name.ar) throw new Error("Nom FR/AR manquant");
  const summary = l10n(o, "summary", 600);
  if (!summary.fr || !summary.ar) throw new Error("Résumé FR/AR manquant");
  const hex = text(o.swatch_hex, 7);
  const tone = text(o.tone, 10) as Tone;
  const cat = text(o.category_slug, 80);
  const sizes = Array.isArray(o.sizes)
    ? [...new Set(o.sizes.map(Number).filter((n) => Number.isInteger(n) && n >= 15 && n <= 50))].sort((a, b) => a - b).slice(0, 20)
    : [];
  const price = money(o.price);
  const oldPrice = money(o.old_price);
  const model = slugify(text(o.model, 80));
  return {
    name,
    // One product for all its colours: the slug never contains the colour.
    slug: slugify(text(o.slug, 80) || model || name.fr),
    model,
    categorySlug: categorySlugs.includes(cat) ? cat : null,
    colorName: l10n(o, "color", 40),
    swatchHex: /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : "#c9a78a",
    tone: TONES.includes(tone) ? tone : "other",
    summary,
    description: { fr: text(o.description_fr, 3000), ar: text(o.description_ar, 3000) },
    specs: { material: l10n(o, "material", 120), lining: l10n(o, "lining", 120), soleHeight: l10n(o, "sole", 120), care: l10n(o, "care", 300) },
    imageAlt: l10n(o, "alt", 160),
    price,
    oldPrice: oldPrice && price && oldPrice > price ? oldPrice : null,
    sizes,
  };
}

const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_IMAGE_CHARS = 1_400_000; // ~1 MB image (the browser shrinks photos before sending)

export async function draftProduct(input: { note: string; image: string | null; categories: { slug: string; name: string }[]; shippingSentence: string }) {
  const note = text(input.note, 1500);
  const image = input.image && input.image.length <= MAX_IMAGE_CHARS && IMAGE_RE.test(input.image) ? input.image : null;
  if (!note && !image) throw new Error("Ajoutez une photo ou une note.");
  const sys = systemPrompt(input.categories, input.shippingSentence);
  const noteText = note ? `Note du vendeur : ${note}` : "Pas de note : décris le produit d’après la photo.";

  return generateJson<ProductDraft>(
    (vision): ChatMessage[] | null => {
      if (vision && image) {
        return [
          { role: "system", content: sys },
          { role: "user", content: [{ type: "text", text: `${noteText}\nVoici la photo du produit.` }, { type: "image_url", image_url: { url: image } }] },
        ];
      }
      // Text-only model: needs the seller's note.
      if (!note) return null;
      return [
        { role: "system", content: sys },
        { role: "user", content: `${noteText}\n(Aucune photo disponible pour ce modèle : base-toi uniquement sur la note ; swatch_hex = couleur typique du nom de couleur.)` },
      ];
    },
    (data) => parseDraft(data, input.categories.map((c) => c.slug)),
  );
}
