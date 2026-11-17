import { formatPrice, fmt, type Lang } from "@/lib/format";

export default function Price({ price, oldPrice, lang, saveLabel, size = "md" }: { price: number; oldPrice: number | null; lang: Lang; saveLabel?: string; size?: "md" | "lg" }) {
  const hasOld = !!oldPrice && oldPrice > price;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-semibold tabular-nums ${size === "lg" ? "text-3xl" : "text-base"}`}>{formatPrice(price, lang)}</span>
      {hasOld && (
        <del className={`tabular-nums text-muted ${size === "lg" ? "text-lg" : "text-sm"}`}>{formatPrice(oldPrice!, lang)}</del>
      )}
      {hasOld && saveLabel && (
        <span className="rounded-full bg-accent-dark/10 px-2.5 py-0.5 text-xs font-bold text-accent-dark">
          {fmt(saveLabel, { amount: formatPrice(oldPrice! - price, lang) })}
        </span>
      )}
    </span>
  );
}
