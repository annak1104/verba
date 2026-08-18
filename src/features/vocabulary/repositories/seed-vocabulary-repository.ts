import {seedDecks, seedWords} from "@/features/vocabulary/data/seed";
import type {CreateCardInput, CreateDeckInput, Deck, Word} from "@/features/vocabulary/types";
import type {VocabularyRepository} from "./vocabulary-repository";

export class SeedVocabularyRepository implements VocabularyRepository {
  async ensureDefaultDeck(): Promise<Deck> {
    return seedDecks[0]!;
  }

  async listDecks(): Promise<Deck[]> {
    return seedDecks;
  }

  async listWords(): Promise<Word[]> {
    return seedWords;
  }

  async listDueWords(_userId: string, isoDate: string): Promise<Word[]> {
    return seedWords.filter((word) => word.dueOn <= isoDate);
  }

  async createDeck(_userId: string, input: CreateDeckInput): Promise<Deck> {
    return {
      id: `demo-${input.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: input.name,
      description: input.description ?? "",
      color: input.color ?? "emerald",
      position: 0,
      wordCount: 0,
      dueCount: 0,
      learningCount: 0,
      masteredCount: 0,
      progress: 0
    };
  }

  async updateDeck(_userId: string, input: CreateDeckInput & {id: string}): Promise<Deck> {
    return {
      ...seedDecks[0]!,
      id: input.id,
      name: input.name ?? seedDecks[0]!.name,
      description: input.description ?? seedDecks[0]!.description,
      color: input.color ?? seedDecks[0]!.color
    };
  }

  async deleteDeck(): Promise<void> {}

  async moveDeck(): Promise<void> {}

  async createCard(_userId: string, input: CreateCardInput): Promise<Word> {
    const word: Word = {
      id: `demo-${input.english.toLowerCase().replace(/\s+/g, "-")}`,
      term: input.english,
      meaning: input.ukrainianTranslation,
      example: input.exampleEnglish ?? "",
      pronunciation: input.ukrainianPronunciation,
      favorite: input.favorite ?? false,
      difficulty: input.difficulty ?? 1,
      tags: (input.tags ?? []).map((tag) => ({id: tag, name: tag, color: "cyan"})),
      deckId: input.deckId,
      deckName: "Demo",
      memoryState: "new",
      easeFactor: 250,
      intervalDays: 0,
      repetitions: 0,
      dueOn: new Date().toISOString().slice(0, 10)
    };

    if (input.ipa) word.ipa = input.ipa;
    if (input.exampleUkrainian) word.exampleUkrainian = input.exampleUkrainian;
    if (input.notes) word.notes = input.notes;

    return word;
  }

  async updateCard(_userId: string, input: CreateCardInput & {id: string}): Promise<Word> {
    return this.createCard(_userId, input);
  }

  async deleteCard(): Promise<void> {}

  async toggleFavorite(): Promise<void> {}

  async listTags(): Promise<Array<{id: string; name: string; color: string}>> {
    return [];
  }
}
