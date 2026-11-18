import Link from "next/link";
import Logo from "./Logo";
import { ChatIcon, MailIcon, PinIcon } from "../icons";
import { getDictionary } from "@/lib/i18n";
import { getCategories } from "@/lib/data";
import { SITE, displayPhone, whatsappLink } from "@/lib/site";
import { href, paths } from "@/lib/routes";
import type { Locale } from "@/lib/locales";

export default async function SiteFooter({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const categories = await getCategories();
  const linkCls = "text-paper/75 transition hover:text-paper";
  return (
    <footer className="surface-dark mt-24 bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href={href(lang)} aria-label={t.a11y.home} className="inline-block rounded-xl">
            <Logo variant="light" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/75">{t.footer.tagline}</p>
        </div>
        <nav aria-label={t.footer.shop}>
          <h2 className="text-base font-semibold text-paper">{t.footer.shop}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className={linkCls} href={href(lang, paths.shop)}>{t.footer.allProducts}</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link className={linkCls} href={href(lang, paths.category(c.slug))}>{c.name[lang]}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.help}>
          <h2 className="text-base font-semibold text-paper">{t.footer.help}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className={linkCls} href={href(lang, paths.guides)}>{t.nav.guides}</Link></li>
            <li><Link className={linkCls} href={href(lang, paths.sizeGuide)}>{t.nav.sizeGuide}</Link></li>
            <li><Link className={linkCls} href={href(lang, paths.faq)}>{t.nav.faq}</Link></li>
            <li><Link className={linkCls} href={href(lang, paths.about)}>{t.nav.about}</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-base font-semibold text-paper">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a className={`${linkCls} inline-flex items-center gap-2`} href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <ChatIcon width={18} height={18} /> <span>WhatsApp</span> <span dir="ltr">{displayPhone()}</span>
              </a>
            </li>
            <li>
              <a className={`${linkCls} inline-flex items-center gap-2`} href={`mailto:${SITE.email}`}>
                <MailIcon width={18} height={18} /> {SITE.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2 text-paper/75"><PinIcon width={18} height={18} /> {t.footer.city}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="container-page py-5 text-xs text-paper/60">© {new Date().getFullYear()} Naalora. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
