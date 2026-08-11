// OpenSloth — Shared 9router AI Client (OpenAI-compatible)
//
// Unifies all AI content pipelines onto ONE lazily-instantiated client.
// Base URL points to a LOCAL opencode proxy — DEV/SEEDING ONLY, never production.
// All callers degrade gracefully: generateJSON returns null on any failure so
// pipelines can fall back to heuristics/mocks instead of hard-failing.

import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

/**
 * Lazily-instantiated singleton OpenAI client pointed at 9router.
 * Reads AI_BASE_URL / AI_API_KEY from the environment at first call.
 */
export function getAIClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: process.env.AI_API_KEY,
    });
  }
  return cachedClient;
}

/**
 * Resolve the configured model, defaulting to "9r-apply".
 */
export function getAIModel(): string {
  return process.env.AI_MODEL || "9r-apply";
}

/**
 * True when both AI_API_KEY and AI_BASE_URL are non-empty.
 * Callers use this to decide whether to attempt AI or go straight to fallback.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY) && Boolean(process.env.AI_BASE_URL);
}

export interface GenerateJSONOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * Request a JSON object from the model and parse it.
 * Returns null (never throws) on: unconfigured client, network/API error,
 * empty response, or unparseable JSON — so callers can fall back safely.
 *
 * The first balanced `{...}` block in the response is extracted before parsing
 * to tolerate models that wrap JSON in prose or code fences.
 */
export async function generateJSON<T>(opts: GenerateJSONOptions): Promise<T | null> {
  if (!isAIConfigured()) {
    console.warn("[ai] AI_API_KEY/AI_BASE_URL not configured — skipping AI call");
    return null;
  }

  try {
    const client = getAIClient();
    const completion = await client.chat.completions.create({
      model: opts.model ?? getAIModel(),
      max_tokens: opts.maxTokens ?? 800,
      temperature: opts.temperature ?? 0.7,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    if (!text.trim()) {
      console.warn("[ai] Empty response from model");
      return null;
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("[ai] No JSON object found in model response");
      return null;
    }

    return JSON.parse(match[0]) as T;
  } catch (error) {
    console.error("[ai] generateJSON failed:", error);
    return null;
  }
}
