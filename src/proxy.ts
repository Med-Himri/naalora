import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "./lib/locales";

function preferredLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("lang")?.value;
  if (isLocale(cookie)) return cookie;

  // Accept-Language: "ar-MA,ar;q=0.9,fr;q=0.8" → first supported language by quality
  const header = req.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .filter((x) => x.lang && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((x) => isLocale(x.lang));
  return match ? (match.lang as Locale) : defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const lang = preferredLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except Next internals, admin, API, feeds and files with an extension
  matcher: ["/((?!_next|admin|api|feed|.*\\..*).*)"],
};
