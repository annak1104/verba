import {describe, expect, it} from "vitest";
import {
  getReviewCardContent,
  getVisibleSpeakerActionCount,
  normalizeReviewDirection
} from "@/features/review/card-content";
import type {Word} from "@/features/vocabulary/types";

describe("review card content", () => {
  it("uses English prompt and Ukrainian answer for EN to UK", () => {
    const content = getReviewCardContent(word(), "english_to_ukrainian");

    expect(content.frontTitle).toBe("word");
    expect(content.expectedAnswer).toBe("слово");
    expect(content.ukrainianPronunciation).toBe("slovo");
    expect(content.ipa).toBe("/wɜːd/");
  });

  it("uses Ukrainian prompt and English answer for UK to EN", () => {
    const content = getReviewCardContent(word(), "ukrainian_to_english");

    expect(content.frontTitle).toBe("слово");
    expect(content.frontSubtitle).toBe("slovo");
    expect(content.expectedAnswer).toBe("word");
    expect(content.english).toBe("word");
  });

  it("normalizes mixed direction to the minimal EN to UK review mode", () => {
    expect(normalizeReviewDirection("mixed")).toBe("english_to_ukrainian");
    expect(normalizeReviewDirection("ukrainian_to_english")).toBe("ukrainian_to_english");
  });

  it("exposes only one pronunciation action per visible card state", () => {
    expect(getVisibleSpeakerActionCount(word(), "english_to_ukrainian", false)).toBe(1);
    expect(getVisibleSpeakerActionCount(word(), "ukrainian_to_english", false)).toBe(0);
    expect(getVisibleSpeakerActionCount(word(), "english_to_ukrainian", true)).toBe(1);
    expect(getVisibleSpeakerActionCount(word(), "ukrainian_to_english", true)).toBe(1);
  });
});

function word(): Word {
  return {
    id: "one",
    term: "word",
    meaning: "слово",
    example: "A useful word.",
    favorite: false,
    difficulty: 1,
    tags: [],
    deckId: "deck",
    deckName: "Deck",
    memoryState: "new",
    easeFactor: 250,
    intervalDays: 0,
    repetitions: 0,
    dueOn: "2026-08-18",
    pronunciation: "slovo",
    ipa: "/wɜːd/",
    exampleUkrainian: "Корисне слово."
  };
}
