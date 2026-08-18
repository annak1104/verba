import type {Deck, Word} from "@/features/vocabulary/types";

export const seedDecks: Deck[] = [
  {
    id: "daily-life",
    name: "Daily life",
    description: "Useful words for routines, errands, and small talk.",
    color: "emerald",
    position: 0,
    wordCount: 4,
    dueCount: 2,
    learningCount: 1,
    masteredCount: 1,
    progress: 25
  },
  {
    id: "work",
    name: "Work",
    description: "Clear vocabulary for meetings, tasks, and planning.",
    color: "cyan",
    position: 1,
    wordCount: 3,
    dueCount: 2,
    learningCount: 0,
    masteredCount: 0,
    progress: 0
  },
  {
    id: "travel",
    name: "Travel",
    description: "Airport, hotel, and city navigation essentials.",
    color: "amber",
    position: 2,
    wordCount: 3,
    dueCount: 0,
    learningCount: 0,
    masteredCount: 1,
    progress: 33
  }
];

export const seedWords: Word[] = [
  {
    id: "w-errand",
    term: "errand",
    meaning: "a short trip to do a practical task",
    example: "I need to run an errand before lunch.",
    pronunciation: "EH-ruhund",
    favorite: false,
    difficulty: 2,
    tags: [{id: "everyday", name: "everyday", color: "cyan"}],
    deckId: "daily-life",
    deckName: "Daily life",
    memoryState: "reviewing",
    easeFactor: 250,
    intervalDays: 3,
    repetitions: 4,
    dueOn: "2026-08-18"
  },
  {
    id: "w-sturdy",
    term: "sturdy",
    meaning: "strong, solid, and unlikely to break",
    example: "These boots are sturdy enough for a long walk.",
    deckId: "daily-life",
    deckName: "Daily life",
    favorite: true,
    difficulty: 2,
    tags: [],
    memoryState: "learning",
    easeFactor: 240,
    intervalDays: 1,
    repetitions: 1,
    dueOn: "2026-08-18"
  },
  {
    id: "w-follow-up",
    term: "follow-up",
    meaning: "an action after a previous conversation or task",
    example: "Send a follow-up after the meeting.",
    deckId: "work",
    deckName: "Work",
    favorite: false,
    difficulty: 1,
    tags: [{id: "work", name: "work", color: "emerald"}],
    memoryState: "new",
    easeFactor: 250,
    intervalDays: 0,
    repetitions: 0,
    dueOn: "2026-08-18"
  },
  {
    id: "w-itinerary",
    term: "itinerary",
    meaning: "a plan for a journey with places and times",
    example: "The itinerary includes two museums and a food tour.",
    pronunciation: "eye-TIN-uh-rer-ee",
    favorite: true,
    difficulty: 3,
    tags: [{id: "travel", name: "travel", color: "amber"}],
    deckId: "travel",
    deckName: "Travel",
    memoryState: "mastered",
    easeFactor: 270,
    intervalDays: 16,
    repetitions: 6,
    dueOn: "2026-08-24"
  },
  {
    id: "w-defer",
    term: "defer",
    meaning: "to delay something until a later time",
    example: "Let's defer the decision until Friday.",
    deckId: "work",
    deckName: "Work",
    favorite: false,
    difficulty: 2,
    tags: [],
    memoryState: "reviewing",
    easeFactor: 255,
    intervalDays: 7,
    repetitions: 5,
    dueOn: "2026-08-18"
  }
];
