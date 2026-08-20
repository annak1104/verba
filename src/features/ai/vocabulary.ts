import "server-only";

import {z} from "zod";
import {getAIService} from "@/features/ai";

export const aiVocabularySuggestionSchema = z.object({
  english: z.string().trim().min(1).max(180),
  ukrainianTranslation: z.string().trim().min(1).max(2000),
  ukrainianPronunciation: z.string().trim().min(1).max(180),
  ipa: z.string().trim().min(1).max(180),
  exampleEnglish: z.string().trim().min(1).max(600),
  exampleUkrainian: z.string().trim().min(1).max(600)
});

export type AiVocabularySuggestion = z.output<typeof aiVocabularySuggestionSchema>;

export type VocabularyEnrichmentField = keyof AiVocabularySuggestion;

export async function suggestVocabulary(
  term: string,
  locale: "en" | "uk",
  context?: Partial<AiVocabularySuggestion> & {
    requestedFields?: VocabularyEnrichmentField[];
  }
) {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) {
    return {ok: false as const, code: "invalid_response" as const};
  }

  return getAIService().generateObjectResult({
    schema: aiVocabularySuggestionSchema,
    schemaName: "vocabulary_suggestion",
    temperature: 0,
    topP: 1,
    maxTokens: 220,
    messages: [
      {
        role: "system",
        content:
          "Return only compact JSON matching the schema. No markdown. No explanation. No reasoning."
      },
      {
        role: "user",
        content: [
          `English: ${trimmedTerm}`,
          `Locale: ${locale}`,
          "Return keys: english, ukrainianTranslation, ukrainianPronunciation, ipa, exampleEnglish, exampleUkrainian.",
          "Use concise values.",
          "ukrainianTranslation: Ukrainian translation.",
          "ukrainianPronunciation: Ukrainian phonetic hint.",
          "ipa: English IPA in slashes.",
          "exampleEnglish: short natural English sentence.",
          "exampleUkrainian: Ukrainian translation of exampleEnglish.",
          context?.exampleEnglish
            ? `Existing exampleEnglish: ${context.exampleEnglish}`
            : "",
          context?.ukrainianTranslation
            ? `Existing ukrainianTranslation: ${context.ukrainianTranslation}`
            : "",
          context?.ukrainianPronunciation
            ? `Existing ukrainianPronunciation: ${context.ukrainianPronunciation}`
            : "",
          context?.ipa ? `Existing ipa: ${context.ipa}` : "",
          context?.exampleUkrainian
            ? `Existing exampleUkrainian: ${context.exampleUkrainian}`
            : ""
        ]
          .filter(Boolean)
          .join("\n")
      }
    ]
  });
}
