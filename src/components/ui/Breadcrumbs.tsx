import Link from "next/link";
import { ChevronIcon } from "../icons";

export type Crumb = { name: string; href?: string };

export default function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronIcon width={14} height={14} className="rtl:rotate-180" />}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-ink hover:underline">{c.name}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
