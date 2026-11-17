import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";
import { hreflang, ogLocale, type Locale } from "./locales";

type Args = {
  lang: Locale;
  /** Path without the language prefix, e.g. "/boutique" ("" for home) */
  path: string;
  title: string;
  description: string;
  /** Use the title as is (no "| Naalora" suffix) */
  absoluteTitle?: boolean;
  noindex?: boolean;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  /** Generated share image path (e.g. "/og/home/fr"), used when no images are given */
  og?: string;
  type?: "website" | "article";
};

/** Cloudinary photo → 1200×630 JPG share image. Non-Cloudinary images (SVG placeholders) → null. */
export function shareImageFrom(url: string | undefined): string | null {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return null;
  return url.replace("/upload/", "/upload/c_pad,b_rgb:f7f0e6,w_1200,h_630,f_jpg,q_auto/");
}

/** Canonical + hreflang (fr-MA, ar-MA, x-default → /fr) + Open Graph + Twitter for every page. */
export function pageMetadata({ lang, path, title, description, absoluteTitle, noindex, images, og, type = "website" }: Args): Metadata {
  const url = absoluteUrl(`/${lang}${path}`);
  const other: Locale = lang === "fr" ? "ar" : "fr";
  const desc = description.length > 160 ? `${description.slice(0, 155).replace(/\s+\S*$/, "")}…` : description;
  const imgs = images?.length ? images : og ? [{ url: og, width: 1200, height: 630, alt: title }] : undefined;
  const ogImages = imgs?.map((i) => ({ ...i, url: i.url.startsWith("http") ? i.url : absoluteUrl(i.url) }));
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        [hreflang.fr]: absoluteUrl(`/fr${path}`),
        [hreflang.ar]: absoluteUrl(`/ar${path}`),
        "x-default": absoluteUrl(`/fr${path}`),
      },
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title: absoluteTitle ? title : `${title} | ${SITE.name}`,
      description: desc,
      locale: ogLocale[lang],
      alternateLocale: [ogLocale[other]],
      ...(ogImages?.length ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} | ${SITE.name}`,
      description: desc,
      ...(ogImages?.length ? { images: ogImages.map((i) => i.url) } : {}),
    },
  };
}
