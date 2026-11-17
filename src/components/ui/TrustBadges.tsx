import { CashIcon, ChatIcon, SwapIcon, TruckIcon } from "../icons";

const ICONS = [CashIcon, TruckIcon, SwapIcon, ChatIcon];

export default function TrustBadges({ items, compact = false }: { items: { title: string; text: string }[]; compact?: boolean }) {
  return (
    <ul className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
      {items.map((b, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={b.title} className="flex items-start gap-3 rounded-[20px] bg-paper p-4 shadow-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand text-accent-dark"><Icon width={20} height={20} /></span>
            <span>
              <span className="block text-sm font-semibold">{b.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{b.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
