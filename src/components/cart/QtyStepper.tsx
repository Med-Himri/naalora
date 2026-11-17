"use client";

import { MinusIcon, PlusIcon } from "../icons";

type Props = {
  value: number;
  max: number;
  onChange: (qty: number) => void;
  labels: { increase: string; decrease: string; quantity: string };
  min?: number;
  size?: "sm" | "md";
};

export default function QtyStepper({ value, max, onChange, labels, min = 1, size = "sm" }: Props) {
  const btn = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-paper" role="group" aria-label={labels.quantity}>
      <button type="button" className={`${btn} grid place-items-center rounded-full text-ink transition hover:bg-sand disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={labels.decrease}>
        <MinusIcon width={16} height={16} />
      </button>
      <output className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</output>
      <button type="button" className={`${btn} grid place-items-center rounded-full text-ink transition hover:bg-sand disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={labels.increase}>
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
