"use client";

/**
 * Inline <script> that runs once, during HTML parsing (before the first paint).
 * On the client it is rendered as text/plain so React does not warn about script tags
 * (pattern from the Next.js guide "Preventing flash before hydration").
 */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
