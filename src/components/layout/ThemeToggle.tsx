"use client";

import { MoonIcon, SunIcon } from "../icons";

export const THEME_KEY = "naalora-theme";

/**
 * Runs in <head> before the first paint: saved choice, otherwise the system setting.
 * Kept as a plain string so it can be inlined by the layout.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/** Light / dark switch. Both icons are rendered; CSS shows the right one (no hydration mismatch). */
export default function ThemeToggle({ label, className = "" }: { label: string; className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
  }
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={className}>
      <MoonIcon className="theme-icon-moon" />
      <SunIcon className="theme-icon-sun" />
    </button>
  );
}
