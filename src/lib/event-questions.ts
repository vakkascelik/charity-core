/**
 * Per-event custom RSVP questions, stored on `Event.questions` (Json) and
 * answered into `Rsvp.answers` (Json, keyed by question label).
 *
 * Kept free of server-only imports so both the public RsvpForm (client) and
 * the API routes (server) can share the same shape and sanitiser.
 */

export type EventQuestion = {
  label: string;
  type: "text" | "select" | "yesno";
  required: boolean;
  /** Choices for `select` questions. */
  options?: string[];
};

const TYPES: EventQuestion["type"][] = ["text", "select", "yesno"];

/** Accept only absolute http(s) URLs for the external-registration link. */
export function cleanRegistrationUrl(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return /^https?:\/\//i.test(s) ? s : null;
}

/**
 * Parse the untrusted Json column (or admin form payload) into a clean list.
 * Drops anything without a label; unknown types fall back to free text.
 */
export function parseQuestions(v: unknown): EventQuestion[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((q): EventQuestion => {
      const raw = (q ?? {}) as Record<string, unknown>;
      const type = TYPES.includes(raw.type as EventQuestion["type"])
        ? (raw.type as EventQuestion["type"])
        : "text";
      const options = Array.isArray(raw.options)
        ? raw.options.map((o) => String(o).trim()).filter(Boolean)
        : undefined;
      return {
        label: String(raw.label ?? "").trim(),
        type,
        required: Boolean(raw.required),
        ...(type === "select" ? { options: options ?? [] } : {}),
      };
    })
    .filter((q) => q.label);
}

/**
 * Keep only answers to the event's actual questions and check required ones.
 * Returns the cleaned answers or an error message naming the missing field.
 */
export function validateAnswers(
  questions: EventQuestion[],
  raw: unknown,
): { answers: Record<string, string> } | { error: string } {
  const given = (raw ?? {}) as Record<string, unknown>;
  const answers: Record<string, string> = {};
  for (const q of questions) {
    const val = String(given[q.label] ?? "").trim().slice(0, 500);
    if (val) answers[q.label] = val;
    else if (q.required) return { error: `Please answer: ${q.label}` };
  }
  return { answers };
}
