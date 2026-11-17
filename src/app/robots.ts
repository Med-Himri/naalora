import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const DISALLOW = ["/admin", "/fr/commande", "/ar/commande", "/api"];

// Search engines and AI assistants (ChatGPT, Claude, Perplexity, Gemini) are explicitly welcome.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
