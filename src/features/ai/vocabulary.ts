import "server-only";

import {z} from "zod";
import {getAIService} from "@/features/ai";

export const aiVocabularySuggestionSchema = z.object({
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
): Promise<AiVocabularySuggestion | null> {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) {
    return null;
  }

  return getAIService().generateObject({
    schema: aiVocabularySuggestionSchema,
    schemaName: "vocabulary_suggestion",
    temperature: 0.2,
    maxTokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You help Ukrainian speakers learn English vocabulary. Return only JSON that matches the requested schema."
      },
      {
        role: "user",
        content: [
          `Suggest a concise vocabulary card for the English term: ${trimmedTerm}`,
          `Interface locale: ${locale}`,
          `Requested fields: ${context?.requestedFields?.join(", ") || "all missing fields"}`,
          "ukrainianTranslation should be a concise Ukrainian translation or explanation.",
          "ukrainianPronunciation should be a Ukrainian-style pronunciation hint.",
          "ipa should be standard English IPA wrapped in slashes.",
          "exampleEnglish should be a natural English sentence using the term.",
          "exampleUkrainian should be a Ukrainian translation of exampleEnglish.",
          context?.exampleEnglish
            ? `If possible, translate this existing English example for exampleUkrainian: ${context.exampleEnglish}`
            : "",
          context?.ukrainianTranslation
            ? `Existing Ukrainian translation: ${context.ukrainianTranslation}`
            : "",
          context?.ukrainianPronunciation
            ? `Existing Ukrainian pronunciation: ${context.ukrainianPronunciation}`
            : "",
          context?.ipa ? `Existing IPA: ${context.ipa}` : "",
          context?.exampleUkrainian
            ? `Existing Ukrainian example: ${context.exampleUkrainian}`
            : ""
        ].join("\n")
      }
    ]
  });
}
