import { getActiveProducts, getCategories, getShippingSettings } from "@/lib/data";
import { shippingFor } from "@/lib/pricing";
import { SITE, absoluteUrl } from "@/lib/site";
import { locales } from "@/lib/locales";
import { getDictionary } from "@/lib/i18n";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const money = (n: number) => `${n.toFixed(2)} ${SITE.currency}`;

/** Google Merchant Center needs JPG/PNG: Cloudinary photos are converted, placeholders use the generated card. */
function feedImage(url: string, fallback: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) return url.replace("/upload/", "/upload/f_jpg,q_auto,w_1200/");
  return absoluteUrl(fallback);
}

/** RSS 2.0 product feed for Google Merchant Center — every active product in French and Arabic. */
export async function GET() {
  const [products, categories, shipping] = await Promise.all([getActiveProducts(), getCategories(), getShippingSettings()]);
  const items = products.flatMap((p) =>
    locales.map((lang) => {
      const inStock = p.sizes.some((s) => s.stock > 0);
      const onSale = !!p.oldPrice && p.oldPrice > p.price;
      const cat = categories.find((c) => c.id === p.categoryId);
      const [first, ...rest] = p.images;
      return `    <item>
      <g:id>${esc(`${p.sku || p.slug}-${lang}`)}</g:id>
      <g:item_group_id>${esc(p.sku || p.slug)}</g:item_group_id>
      <title>${esc(p.name[lang])}</title>
      <description>${esc(`${p.summary[lang]} ${p.description[lang]}`.replace(/\s+/g, " ").trim())}</description>
      <link>${absoluteUrl(`/${lang}/produit/${p.slug}`)}</link>
      <g:image_link>${esc(feedImage(first?.url ?? "", `/og/product/fr/${p.slug}`))}</g:image_link>
${rest.slice(0, 10).filter((i) => i.url.includes("res.cloudinary.com")).map((i) => `      <g:additional_image_link>${esc(feedImage(i.url, ""))}</g:additional_image_link>`).join("\n")}
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${money(onSale ? (p.oldPrice as number) : p.price)}</g:price>
${onSale ? `      <g:sale_price>${money(p.price)}</g:sale_price>\n` : ""}      <g:condition>new</g:condition>
      <g:brand>${esc(SITE.name)}</g:brand>
      <g:mpn>${esc(p.sku || p.slug)}</g:mpn>
      <g:color>${esc(p.colorName[lang])}</g:color>
      <g:material>${esc(p.specs.material[lang])}</g:material>
      <g:size>${esc(p.sizes.filter((s) => s.stock > 0).map((s) => s.size).join("/") || p.sizes.map((s) => s.size).join("/"))}</g:size>
      <g:size_system>EU</g:size_system>
      <g:google_product_category>187</g:google_product_category>
      <g:product_type>${esc(cat ? `${cat.name[lang]}` : "")}</g:product_type>
      <g:content_language>${lang}</g:content_language>
      <g:target_country>${SITE.country}</g:target_country>
      <g:shipping>
        <g:country>${SITE.country}</g:country>
        <g:price>${money(shippingFor(p.price, shipping))}</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>1</g:max_handling_time>
        <g:min_transit_time>${SITE.deliveryDays.min}</g:min_transit_time>
        <g:max_transit_time>${SITE.deliveryDays.max}</g:max_transit_time>
      </g:shipping>
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${esc(getDictionary("fr").meta.siteDescription)}</description>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
