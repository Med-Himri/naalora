import "server-only";

/**
 * Minimal Groq client (OpenAI-compatible REST API, no SDK) with model fallback.
 * Models are tried in order: if one fails (error, rate limit, timeout, retired model,
 * invalid JSON), the next one takes over.
 *
 * GROQ_API_KEY        — required (server only)
 * GROQ_MODELS         — optional, comma-separated, in order of preference
 * GROQ_VISION_MODELS  — optional, comma-separated: which of them can read images
 */

const DEFAULT_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const DEFAULT_VISION = ["qwen/qwen3.8-27b"];
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 30_000;

const list = (v: string | undefined, fallback: string[]) => {
  const items = (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? items : fallback;
};

export const groqModels = () => list(process.env.GROQ_MODELS, DEFAULT_MODELS);
export const groqVisionModels = () => list(process.env.GROQ_VISION_MODELS, DEFAULT_VISION);
export const groqConfigured = () => !!process.env.GROQ_API_KEY;

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
export type ChatMessage = { role: "system" | "user"; content: string | Part[] };

export type Attempt = { model: string; ok: boolean; ms: number; error?: string };

export class GroqError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function callModel(model: string, messages: ChatMessage[]): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_completion_tokens: 2500,
        response_format: { type: "json_object" },
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: { message?: string }; choices?: { message?: { content?: string } }[] } | null;
    if (!res.ok) throw new GroqError(json?.error?.message?.slice(0, 200) || `HTTP ${res.status}`, res.status);
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new GroqError("Réponse vide");
    return content;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new GroqError(`Délai dépassé (${TIMEOUT_MS / 1000} s)`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Pull the JSON object out of a model reply (handles ```json fences and <think> blocks). */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new GroqError("Pas de JSON dans la réponse");
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Tries each model in order. `build(vision)` returns the messages for that model,
 * or null to skip it (e.g. a text-only model when only a photo was given).
 * `parse` validates the JSON; a model whose output does not parse counts as failed.
 */
export async function generateJson<T>(
  build: (vision: boolean) => ChatMessage[] | null,
  parse: (data: unknown) => T,
): Promise<{ result: T; model: string; attempts: Attempt[] }> {
  if (!groqConfigured()) throw new GroqError("GROQ_API_KEY n’est pas configurée sur le serveur.");
  const vision = new Set(groqVisionModels());
  const attempts: Attempt[] = [];
  for (const model of groqModels()) {
    const messages = build(vision.has(model));
    if (!messages) {
      attempts.push({ model, ok: false, ms: 0, error: "ignoré (ne lit pas les photos et aucune note)" });
      continue;
    }
    const t = Date.now();
    try {
      const result = parse(extractJson(await callModel(model, messages)));
      attempts.push({ model, ok: true, ms: Date.now() - t });
      return { result, model, attempts };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      attempts.push({ model, ok: false, ms: Date.now() - t, error: msg.slice(0, 160) });
      console.warn(`[groq] ${model} a échoué : ${msg}`);
    }
  }
  const e = new GroqError("Aucun modèle n’a répondu correctement.");
  (e as GroqError & { attempts?: Attempt[] }).attempts = attempts;
  throw e;
}
