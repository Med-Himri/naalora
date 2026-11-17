import { PlusIcon } from "../icons";

export default function FaqList({ items, headingLevel = "h3" }: { items: { q: string; a: string }[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[20px] bg-paper shadow-soft">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4">
            <H className="text-base font-semibold leading-snug" style={{ fontFamily: "inherit" }}>{item.q}</H>
            <PlusIcon width={18} height={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="pb-5 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
