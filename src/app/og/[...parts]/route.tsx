import { ImageResponse } from "next/og";
import { getCategoryBySlug, getGuideBySlug, getProductBySlug } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { formatPrice } from "@/lib/format";

/**
 * Share images (1200×630) and the PNG logo for structured data.
 *   /og/logo                    → 512×512 PNG logo
 *   /og/home/fr                 → home
 *   /og/category/fr/<slug>      → category
 *   /og/guide/fr/<slug>         → guide
 *   /og/product/fr/<slug>       → product without a Cloudinary photo
 *   /og/page/fr/<faq|shop|...>  → other pages
 * Only known pages are rendered (no free text from the URL).
 * The built-in OG font is Latin-only, so Arabic pages get a brand card without text.
 */

export const revalidate = 86400;

const C = { cream: "#f7f0e6", sand: "#efe3d2", ink: "#2b2420", accent: "#c4552f", paper: "#fffdf9", muted: "#6f6258" };

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill={C.ink} />
      <path d="M21 40V17l22 23V17" fill="none" stroke={C.paper} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 48.5q17 8 34 0" fill="none" stroke={C.accent} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function card(title: string | null, subtitle: string | null) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.cream, padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Mark size={88} />
          <div style={{ fontSize: 48, letterSpacing: 10, color: C.ink, fontWeight: 600 }}>NAALORA</div>
        </div>
        {title ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 68, lineHeight: 1.08, color: C.ink, fontWeight: 600, maxWidth: 1000 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 32, color: C.muted, maxWidth: 1000 }}>{subtitle}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", height: 12, width: 260, borderRadius: 12, background: C.accent }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: C.muted }}>
          <div>naalora.com</div>
          <div style={{ display: "flex", gap: 12 }}>
            {["#5a3a2b", "#c98c55", "#b7cfe2", "#7a4a30", "#1f1d1c", "#e590ac"].map((c) => (
              <div key={c} style={{ width: 34, height: 34, borderRadius: 34, background: c, border: `3px solid ${C.sand}` }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

export async function GET(_req: Request, ctx: { params: Promise<{ parts: string[] }> }) {
  const { parts } = await ctx.params;
  const [kind, lang, slug] = parts;

  if (kind === "logo") {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.ink }}>
          <svg width="512" height="512" viewBox="0 0 64 64">
            <path d="M21 40V17l22 23V17" fill="none" stroke={C.paper} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 48.5q17 8 34 0" fill="none" stroke={C.accent} strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
      { width: 512, height: 512 },
    );
  }

  if (!isLocale(lang)) return new Response("Not found", { status: 404 });
  const latin = lang === "fr";
  const t = getDictionary("fr");

  if (kind === "home") return card(latin ? "Pantoufles plateforme en daim" : null, latin ? "Paiement à la livraison · Livraison partout au Maroc" : null);

  if (kind === "category" && slug) {
    const c = await getCategoryBySlug(slug);
    if (!c) return new Response("Not found", { status: 404 });
    return card(latin ? c.name.fr : null, latin ? "Livraison partout au Maroc · Paiement à la livraison" : null);
  }

  if (kind === "guide" && slug) {
    const g = await getGuideBySlug(slug);
    if (!g) return new Response("Not found", { status: 404 });
    return card(latin ? g.title.fr : null, latin ? "Guide Naalora" : null);
  }

  if (kind === "product" && slug) {
    const p = await getProductBySlug(slug);
    if (!p) return new Response("Not found", { status: 404 });
    return card(latin ? p.name.fr : null, latin ? formatPrice(p.price, "fr") : null);
  }

  if (kind === "page") {
    const titles: Record<string, string> = {
      shop: t.shop.title,
      guides: t.guides.title,
      faq: t.faq.title,
      sizes: t.sizeGuide.title,
      about: t.about.title,
    };
    if (!slug || !(slug in titles)) return new Response("Not found", { status: 404 });
    return card(latin ? titles[slug] : null, null);
  }

  return new Response("Not found", { status: 404 });
}
