"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/reglages", label: "Réglages" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="-mx-1 overflow-x-auto px-1">
      <ul className="flex w-max gap-1 rounded-full bg-sand p-1">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={`block rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-paper shadow-soft" : "text-ink/75 hover:text-ink"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
