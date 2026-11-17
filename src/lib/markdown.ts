import "server-only";
import { Marked, type Tokens } from "marked";

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Raw HTML in Markdown is dropped and only safe link targets are kept.
const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html() {
      return "";
    },
    link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
      const text = this.parser.parseInline(token.tokens);
      if (!SAFE_URL.test(token.href)) return text;
      const external = /^https?:\/\//i.test(token.href);
      return `<a href="${escapeAttr(token.href)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${text}</a>`;
    },
    image(token: Tokens.Image) {
      if (!/^https:\/\//i.test(token.href)) return "";
      return `<img src="${escapeAttr(token.href)}" alt="${escapeAttr(token.text)}" loading="lazy" decoding="async" />`;
    },
  },
});

export function renderMarkdown(src: string): string {
  return md.parse(src || "", { async: false }) as string;
}

/** Rough reading time in minutes. */
export function readingMinutes(src: string): number {
  return Math.max(1, Math.round((src || "").split(/\s+/).length / 200));
}
