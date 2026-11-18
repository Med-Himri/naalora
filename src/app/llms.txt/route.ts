import { getActiveProducts, getCategories, getPublishedGuides, getShippingSettings } from "@/lib/data";
import { getDictionaryLive, shippingTexts } from "@/lib/i18n";
import { SITE, absoluteUrl, displayPhone } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { priceOf } from "@/lib/product";

export const revalidate = 3600;

/** llms.txt — a short, factual summary for AI assistants (same facts as the pages and JSON-LD). */
export async function GET() {
  const [products, categories, guides, shipping] = await Promise.all([getActiveProducts(), getCategories(), getPublishedGuides(), getShippingSettings()]);
  const fr = await getDictionaryLive("fr");
  const prices = products.flatMap((p) => p.colors.map((c) => priceOf(p, c)));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = !prices.length ? "" : min === max ? `à ${formatPrice(min, "fr")}` : `de ${min} à ${formatPrice(max, "fr")}`;
  const h = SITE.deliveryHours;
  const d = SITE.deliveryDays;

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} est une boutique de chaussures en ligne basée à ${SITE.city.fr} (Maroc). Catalogue actuel : ${categories.map((c) => c.name.fr.toLowerCase()).join(", ")} — ${products.length} articles${range ? `, ${range}` : ""}. Paiement à la livraison uniquement, livraison partout au Maroc.`,
    "",
    "## Faits clés",
    `- Livraison : partout au Maroc, en ${h.min}–${h.max} h (${d.min} à ${d.max} jours).`,
    `- Frais de livraison : ${shippingTexts("fr", shipping).shipSentence}`,
    "- Paiement : en espèces à la livraison (pas de paiement par carte en ligne).",
    `- Échange de taille : gratuit pendant ${SITE.exchangeDays} jours après réception (article non porté, emballage d’origine).`,
    `- Pointures : ${SITE.sizeChart.map((r) => `${r.size} = ${String(r.cm).replace(".", ",")} cm`).join(", ")}. Entre deux tailles : prendre la taille au-dessus.`,
    `- Contact : WhatsApp ${displayPhone()} (https://wa.me/${SITE.whatsapp}), e-mail ${SITE.email}.`,
    "- Langues du site : français (/fr) et arabe (/ar).",
    "",
    "## Catégories",
    ...categories.map((c) => `- [${c.name.fr}](${absoluteUrl(`/fr/boutique/${c.slug}`)}): ${c.intro.fr}`),
    "",
    "## Produits",
    ...products.map((p) => {
      const colors = p.colors.map((c) => {
        const sizes = c.sizes.filter((s) => s.stock > 0).map((s) => s.size);
        return `${c.name.fr} (${formatPrice(priceOf(p, c), "fr")}${sizes.length ? `, tailles ${sizes.join(", ")}` : ", épuisé"})`;
      });
      return `- [${p.name.fr}](${absoluteUrl(`/fr/produit/${p.slug}`)}): ${p.colors.length} couleur(s) — ${colors.join(" ; ")}.`;
    }),
    "",
    "## Guides",
    `- [${fr.sizeGuide.title}](${absoluteUrl("/fr/guide-des-tailles")})`,
    ...guides.map((g) => `- [${g.title.fr}](${absoluteUrl(`/fr/guides/${g.slug}`)}): ${g.excerpt.fr}`),
    "",
    "## FAQ",
    `- [Questions fréquentes](${absoluteUrl("/fr/faq")})`,
    ...fr.faq.items.slice(0, 6).map((it) => `  - ${it.q} ${it.a.split(/(?<=\.)\s/)[0]}`),
    "",
    "## Pages",
    `- [Accueil](${absoluteUrl("/fr")}) · [Boutique](${absoluteUrl("/fr/boutique")}) · [À propos](${absoluteUrl("/fr/a-propos")})`,
    `- Version arabe : ${absoluteUrl("/ar")}`,
    `- Sitemap : ${absoluteUrl("/sitemap.xml")}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
