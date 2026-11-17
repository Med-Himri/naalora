"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { useCart } from "../cart/CartProvider";
import { BagIcon, CloseIcon, MenuIcon, WhatsAppIcon } from "../icons";
import { fmt, type Lang } from "@/lib/format";
import { switchLangPath } from "@/lib/routes";

export type HeaderTexts = {
  nav: { home: string; shop: string; guides: string; faq: string; about: string; sizeGuide: string; menu: string; langShort: string; langCurrent: string };
  a11y: { mainNav: string; openMenu: string; closeMenu: string; openCart: string; cartCount: string; whatsapp: string; switchLang: string; home: string };
};

export default function SiteHeader({ lang, t, whatsappHref }: { lang: Lang; t: HeaderTexts; whatsappHref: string }) {
  const pathname = usePathname() || `/${lang}`;
  const { count, open, bump } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const other: Lang = lang === "fr" ? "ar" : "fr";

  // Close the mobile menu after navigation (state reset during render, no effect needed).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = [
    { href: `/${lang}`, label: t.nav.home, exact: true },
    { href: `/${lang}/boutique`, label: t.nav.shop, alsoActive: `/${lang}/produit` },
    { href: `/${lang}/guides`, label: t.nav.guides },
    { href: `/${lang}/faq`, label: t.nav.faq },
  ];
  const isActive = (l: (typeof links)[number]) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href) || (!!l.alsoActive && pathname.startsWith(l.alsoActive));

  const setLangCookie = () => {
    document.cookie = `lang=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  const iconBtn = "relative grid h-11 w-11 place-items-center rounded-full bg-sand/70 text-ink transition hover:bg-sand";

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-[22px] border border-line/70 bg-paper/80 px-3 backdrop-blur-md transition-shadow duration-300 sm:px-4 ${
          scrolled ? "shadow-lift" : "shadow-soft"
        }`}
      >
        <Link href={`/${lang}`} aria-label={t.a11y.home} className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label={t.a11y.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full bg-sand p-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l) ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive(l) ? "bg-paper text-ink shadow-soft" : "text-ink/75 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={switchLangPath(pathname, other)}
            onClick={setLangCookie}
            hrefLang={other}
            lang={other}
            aria-label={t.a11y.switchLang}
            className="hidden h-11 items-center rounded-full bg-sand/70 px-1 text-sm font-semibold sm:flex"
          >
            <span className={`rounded-full px-3 py-1.5 ${lang === "fr" ? "bg-paper shadow-soft" : "text-ink/60"}`}>FR</span>
            <span className={`rounded-full px-3 py-1.5 ${lang === "ar" ? "bg-paper shadow-soft" : "text-ink/60"}`} style={{ fontFamily: "var(--font-arabic)" }}>ع</span>
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={t.a11y.whatsapp} className={`${iconBtn} hidden sm:grid`}>
            <WhatsAppIcon className="text-whatsapp" />
          </a>
          <button type="button" onClick={open} className={iconBtn} aria-label={`${t.a11y.openCart} — ${fmt(t.a11y.cartCount, { count })}`}>
            <BagIcon />
            {count > 0 && (
              <span key={bump} className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-accent-dark px-1 text-[11px] font-bold text-paper">
                {count}
              </span>
            )}
          </button>
          <button
            ref={menuBtn}
            type="button"
            className={`${iconBtn} lg:hidden`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="mx-auto mt-2 max-w-7xl animate-fade-up rounded-[22px] border border-line/70 bg-paper p-3 shadow-lift lg:hidden"
      >
        <nav aria-label={t.a11y.mainNav}>
          <ul className="grid gap-1">
            {[...links, { href: `/${lang}/guide-des-tailles`, label: t.nav.sizeGuide }, { href: `/${lang}/a-propos`, label: t.nav.about }].map((l) => {
              const active = "exact" in l ? isActive(l as (typeof links)[number]) : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-2xl px-4 py-3 text-base font-medium ${active ? "bg-sand" : "hover:bg-cream"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          <Link href={switchLangPath(pathname, other)} onClick={setLangCookie} hrefLang={other} lang={other} className="btn btn-outline flex-1 !min-h-11 !py-2">
            {lang === "fr" ? "العربية" : "Français"}
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp flex-1 !min-h-11 !py-2">
            <WhatsAppIcon width={18} height={18} /> WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
