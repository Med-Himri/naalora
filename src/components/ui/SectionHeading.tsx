import Link from "next/link";
import { ArrowIcon } from "../icons";

export default function SectionHeading({ title, text, link, id }: { title: string; text?: string; link?: { href: string; label: string }; id?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-3xl sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 max-w-xl text-muted">{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-ink underline-offset-4 hover:underline">
          {link.label} <ArrowIcon width={16} height={16} className="rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}
