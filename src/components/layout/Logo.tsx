export default function Logo({ variant = "dark", className = "" }: { variant?: "dark" | "light"; className?: string }) {
  const box = variant === "dark" ? "#2b2420" : "#fffdf9";
  const n = variant === "dark" ? "#fffdf9" : "#2b2420";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true" className="shrink-0">
        <rect width="64" height="64" rx="16" fill={box} />
        <path d="M21 40V17l22 23V17" fill="none" stroke={n} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 48.5q17 8 34 0" fill="none" stroke="#c4552f" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      <span dir="ltr" className={`font-display text-xl font-semibold tracking-[0.18em] ${variant === "dark" ? "text-ink" : "text-paper"}`} style={{ fontFamily: "var(--font-display)" }}>
        NAALORA
      </span>
    </span>
  );
}
