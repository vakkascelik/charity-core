import Anthropic from "@anthropic-ai/sdk";
import {
  type TranslationLanguage,
  TRANSLATION_SCHEMA,
  translationSystem,
} from "./translation";

/**
 * Shared Claude drafting helper for the charity apps. Owns the client setup,
 * model/params, structured-output plumbing, and refusal/malformed handling so
 * each admin `/generate` route is just a system prompt + a JSON schema.
 *
 * `@anthropic-ai/sdk` is a host-app dependency (peer). This module is dormant —
 * Next only bundles it when an app actually imports it — so an app that ships no
 * AI route (and hasn't installed the SDK) is unaffected.
 */

export const AI_MODEL = "claude-opus-4-8";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

type JsonSchema = { type: "object"; properties: Record<string, unknown>; required: string[]; additionalProperties: false };

export type DraftArgs = {
  /** Full system prompt: brand voice + task rules. */
  system: string;
  /** The user message describing what to draft/polish. */
  task: string;
  /** JSON schema constraining the structured output. */
  schema: JsonSchema;
  maxTokens?: number;
};

export type DraftOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/**
 * Run one structured Claude request and parse it against `requiredKeys`.
 * Returns a tagged outcome so the route maps it to a NextResponse without
 * re-implementing the guard/refusal/parse logic each time.
 */
export async function draftStructured<T extends Record<string, unknown>>(
  args: DraftArgs,
  requiredKeys: (keyof T)[],
): Promise<DraftOutcome<T>> {
  if (!aiConfigured()) {
    return { ok: false, status: 503, error: "AI drafting is not configured yet — set ANTHROPIC_API_KEY." };
  }

  const client = new Anthropic();
  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: args.maxTokens ?? 4000,
    thinking: { type: "adaptive" },
    system: args.system,
    messages: [{ role: "user", content: args.task }],
    output_config: { format: { type: "json_schema", schema: args.schema } },
  });

  if (response.stop_reason === "refusal") {
    return { ok: false, status: 422, error: "The request was declined — try rephrasing." };
  }

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  try {
    const data = JSON.parse(text) as T;
    for (const k of requiredKeys) {
      if (data[k] === undefined || data[k] === null || data[k] === "") throw new Error("incomplete");
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 502, error: "Draft came back malformed — try again." };
  }
}

/** Small helper: fold optional guidance into a polish task. */
export function guidanceLine(instruction?: string): string {
  return instruction?.trim() ? `\nAlso apply this guidance: ${instruction.trim()}` : "";
}

/**
 * Translate a plain-text email body into one language, for bilingual sends.
 * Wraps `draftStructured` with the shared translation prompt/schema so a send
 * route only needs the English text, the target language, and the org name.
 */
export async function translateBody(args: {
  englishText: string;
  lang: TranslationLanguage;
  orgName: string;
}): Promise<DraftOutcome<{ translation: string }>> {
  return draftStructured<{ translation: string }>(
    {
      system: translationSystem({ lang: args.lang, orgName: args.orgName }),
      task: args.englishText,
      schema: TRANSLATION_SCHEMA,
      // Translations can run longer than the source; give headroom over the 4000 default.
      maxTokens: 8000,
    },
    ["translation"],
  );
}
