import { SITE, absoluteUrl, displayPhone } from "./site";
import { hreflang, type Locale } from "./locales";
import type { CategoryDTO, GuideDTO, ProductDTO } from "./types";

/** Server-rendered JSON-LD. "<" is escaped so the content can never close the script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const abs = (u: string) => (u.startsWith("http") ? u : absoluteUrl(u));

export function organizationLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/og/logo"),
    email: SITE.email,
    address: { "@type": "PostalAddress", addressLocality: SITE.city[lang], addressCountry: SITE.country },
    areaServed: { "@type": "Country", name: "MA" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: displayPhone().replace(/\s/g, ""),
      url: `https://wa.me/${SITE.whatsapp}`,
      areaServed: "MA",
      availableLanguage: ["fr", "ar"],
    },
  };
}

export function websiteLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE.name,
    url: absoluteUrl(`/${lang}`),
    inLanguage: hreflang[lang],
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.url) })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}

export function productLd(p: ProductDTO, lang: Locale, category: CategoryDTO | null) {
  const inStock = p.sizes.some((s) => s.stock > 0);
  const url = absoluteUrl(`/${lang}/produit/${p.slug}`);
  const days = SITE.deliveryDays;
  const delivery = {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: days.min, maxValue: days.max, unitCode: "DAY" },
  };
  const destination = { "@type": "DefinedRegion", addressCountry: SITE.country };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name[lang],
    description: p.summary[lang],
    image: p.images.map((i) => abs(i.url)),
    sku: p.sku || p.slug,
    brand: { "@type": "Brand", name: SITE.name },
    color: p.colorName[lang],
    material: p.specs.material[lang] || undefined,
    category: category?.name[lang],
    size: p.sizes.map((s) => String(s.size)),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: SITE.currency,
      price: p.price.toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      acceptedPaymentMethod: { "@type": "PaymentMethod", name: "Cash on delivery" },
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: SITE.shippingFee, currency: SITE.currency },
          shippingDestination: destination,
          deliveryTime: delivery,
        },
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: SITE.currency },
          shippingDestination: destination,
          deliveryTime: delivery,
          eligibleTransactionVolume: { "@type": "PriceSpecification", minPrice: SITE.freeShippingFrom, priceCurrency: SITE.currency },
        },
      ],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: SITE.country,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: SITE.exchangeDays,
        returnFees: "https://schema.org/FreeReturn",
        refundType: "https://schema.org/ExchangeRefund",
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };
}

export function articleLd(g: GuideDTO, lang: Locale, authorName: string) {
  const url = absoluteUrl(`/${lang}/guides/${g.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: g.title[lang],
    description: g.excerpt[lang],
    inLanguage: hreflang[lang],
    mainEntityOfPage: url,
    image: g.cover.url ? [abs(g.cover.url)] : [absoluteUrl(`/og/guide/${lang}/${g.slug}`)],
    datePublished: g.createdAt,
    dateModified: g.updatedAt,
    author: { "@type": "Organization", name: authorName, url: SITE.url },
    publisher: { "@id": ORG_ID, "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl("/og/logo") } },
  };
}
