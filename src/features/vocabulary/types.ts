export type MemoryState = "new" | "learning" | "reviewing" | "mastered";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type LearningDirection = "english_to_ukrainian" | "ukrainian_to_english" | "mixed";
export type ThemePreference = "light" | "dark" | "system";
export type EnglishLevel = "beginner" | "elementary" | "intermediate" | "advanced";
export type PronunciationPreference = "ukrainian" | "ipa" | "both";

export type Deck = {
  id: string;
  name: string;
  description: string;
  color: "emerald" | "cyan" | "amber" | "rose";
  position: number;
  wordCount: number;
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  progress: number;
};

export type Word = {
  id: string;
  term: string;
  meaning: string;
  example: string;
  pronunciation?: string;
  ipa?: string;
  exampleUkrainian?: string;
  notes?: string;
  favorite: boolean;
  difficulty: number;
  tags: Array<{id: string; name: string; color: string}>;
  deckId: string;
  deckName: string;
  memoryState: MemoryState;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueOn: string;
};

export type StudyQueueItem = Pick<Word, "id" | "term" | "meaning" | "deckName" | "memoryState"> & {
  kind: "new" | "review";
};

export type UserSettings = {
  userId: string;
  dailyGoal: number;
  englishLevel: EnglishLevel;
  learningDirection: LearningDirection;
  pronunciationPreference: PronunciationPreference;
  soundEnabled: boolean;
  theme: ThemePreference;
  aiEnabled: boolean;
  onboardingCompletedAt: Date | null;
};

export type CreateCardInput = {
  deckId: string;
  english: string;
  ukrainianTranslation: string;
  ukrainianPronunciation: string;
  ipa?: string;
  exampleEnglish?: string;
  exampleUkrainian?: string;
  notes?: string;
  favorite?: boolean;
  difficulty?: number;
  tags?: string[];
};

export type CreateDeckInput = {
  name: string;
  description?: string;
  color?: Deck["color"];
};

export type UpdateCardInput = Partial<CreateCardInput> & {
  id: string;
};

export type CardFilters = Partial<{
  search: string;
  deckId: string;
  tag: string;
  status: MemoryState | "all";
  favorite: "true" | "false";
  sort: "english" | "created" | "due" | "difficulty";
}>;

export type UpdateDeckInput = Partial<CreateDeckInput> & {
  id: string;
};
