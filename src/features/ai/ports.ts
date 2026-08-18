export type AiVocabularySuggestion = {
  meaning: string;
  examples: string[];
  pronunciation?: string;
};

export interface VocabularyAiProvider {
  suggest(term: string, locale: "en" | "uk"): Promise<AiVocabularySuggestion>;
}

export class NoopVocabularyAiProvider implements VocabularyAiProvider {
  async suggest(): Promise<AiVocabularySuggestion> {
    return {
      meaning: "",
      examples: []
    };
  }
}
