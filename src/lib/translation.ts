import { escapeHtml, renderParagraphs } from "./email-template";

/**
 * Bilingual email support: the languages an admin may add to a send, the
 * system prompt/schema that Claude translates against, and the two-language
 * body rendering.
 *
 * Deliberately free of any `./ai` import — the composer imports
 * `TRANSLATION_LANGUAGES` from a "use client" component, and `./ai` pulls in
 * `@anthropic-ai/sdk`. Routes pair the prompt/schema below with
 * `draftStructured` themselves.
 */

export type TranslationLanguage = {
  /** BCP-47 code. Also the value the composer posts and the send route matches on. */
  code: string;
  /** English name — used in the dropdown and the prompt. */
  label: string;
  /** Native name — the divider label inside the email. */
  endonym: string;
  /** Right-to-left script; flips the translated paragraphs. */
  rtl?: boolean;
};

/**
 * Offered in the composer, in order. Turkish leads: it's the community's
 * second language and the common case. Adding one here is enough — the
 * dropdown, the prompt, and the rendering all read from this list.
 */
export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: "tr", label: "Turkish", endonym: "Türkçe" },
  { code: "mi", label: "te reo Māori", endonym: "Te Reo Māori" },
  { code: "ar", label: "Arabic", endonym: "العربية", rtl: true },
];

/** Resolve a posted language code. Returns null for "" / unknown — i.e. don't translate. */
export function findTranslationLanguage(code: unknown): TranslationLanguage | null {
  return TRANSLATION_LANGUAGES.find((l) => l.code === code) ?? null;
}

export const TRANSLATION_SCHEMA = {
  type: "object" as const,
  properties: {
    translation: {
      type: "string",
      description:
        "The translated email body, plain text, paragraphs separated by blank lines, same paragraph count and order as the original.",
    },
  },
  required: ["translation"],
  additionalProperties: false as const,
};

export function translationSystem({
  lang,
  orgName,
}: {
  lang: TranslationLanguage;
  orgName: string;
}): string {
  return [
    `You translate community emails for ${orgName} from English into ${lang.label} (${lang.endonym}).`,
    "Match the register of the original: warm, plain, community-minded — not formal officialese, not marketing copy.",
    [
      "Rules:",
      `- Output only the ${lang.label} translation. No commentary, no notes, no English echo.`,
      "- Plain text only — no HTML, no markdown.",
      "- Preserve the paragraph structure exactly: same number of paragraphs, same order, one blank line between them. The email renderer splits on blank lines.",
      "- Leave URLs, email addresses, and phone numbers exactly as written.",
      `- Keep "${orgName}" and personal names in their original form.`,
      "- Render dates, times, and numbers naturally for the target language, but never change the actual value.",
      "- Translate the greeting and sign-off to what a native speaker would expect, rather than word-for-word.",
      "- If a phrase has no accurate idiomatic equivalent, choose a simpler faithful wording. Never invent a term or transliterate English as a substitute.",
    ].join("\n"),
  ].join("\n\n");
}

/**
 * English original, a labelled rule, then the translation — one email, both
 * languages, original first so nothing is lost if the translation is off.
 */
export function bilingualBodyHtml({
  englishText,
  translation,
  lang,
}: {
  englishText: string;
  translation: string;
  lang: TranslationLanguage;
}): string {
  return `${renderParagraphs(englishText)}
    <div style="margin:34px 0 20px;border-top:1px solid #e6e0d6"></div>
    <p style="margin:0 0 16px;color:#999;font-size:12.5px;letter-spacing:0.06em;font-family:sans-serif">${escapeHtml(lang.endonym)}</p>
    ${renderParagraphs(translation, { rtl: lang.rtl })}`;
}
