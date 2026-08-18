import {describe, expect, it} from "vitest";
import {
  createReviewSession,
  getCurrentCard,
  getSessionProgress,
  getSessionSummary,
  getSwipeIntent,
  goToNextCard,
  goToPreviousCard,
  gradeCurrentCard,
  hideAnswer,
  revealCard
} from "@/features/review/session-state";
import type {Word} from "@/features/vocabulary/types";

describe("review session state", () => {
  it("keeps 2+ cards reachable with next and previous navigation", () => {
    const session = createReviewSession([word("one"), word("two"), word("three")]);

    expect(getCurrentCard(session)?.id).toBe("one");
    const second = goToNextCard(session);
    expect(getCurrentCard(second)?.id).toBe("two");
    const third = goToNextCard(second);
    expect(getCurrentCard(third)?.id).toBe("three");
    const backToSecond = goToPreviousCard(third);
    expect(getCurrentCard(backToSecond)?.id).toBe("two");
  });

  it("reveals the current card on tap-style action", () => {
    const session = createReviewSession([word("one")]);
    expect(revealCard(session).revealed).toBe(true);
    expect(getSwipeIntent(2, 1)).toBe("tap");
  });

  it("toggles front and back without changing card position", () => {
    const session = createReviewSession([word("one"), word("two")]);
    const revealed = revealCard(session);
    const hidden = hideAnswer(revealed);

    expect(getCurrentCard(hidden)?.id).toBe("one");
    expect(hidden.revealed).toBe(false);
  });

  it("detects horizontal swipe navigation without treating scroll as swipe", () => {
    expect(getSwipeIntent(-80, 12)).toBe("next");
    expect(getSwipeIntent(80, 12)).toBe("previous");
    expect(getSwipeIntent(30, 10)).toBe("ignore");
    expect(getSwipeIntent(80, 90)).toBe("ignore");
  });

  it("grading advances to the next unprocessed card without removing cards", () => {
    const session = revealCard(createReviewSession([word("one"), word("two")]));
    const graded = gradeCurrentCard(session, "good");

    expect(graded.cards).toHaveLength(2);
    expect(graded.processedIds).toEqual(["one"]);
    expect(getCurrentCard(graded)?.id).toBe("two");
    expect(graded.revealed).toBe(false);
    expect(getSessionProgress(graded)).toMatchObject({current: 2, total: 2, processed: 1});
  });

  it("finishes only after all session cards are graded and reports summary", () => {
    const first = gradeCurrentCard(revealCard(createReviewSession([word("one"), word("two")])), "good");
    const complete = gradeCurrentCard(revealCard(first), "again");

    expect(complete.completed).toBe(true);
    expect(getCurrentCard(complete)).toBeNull();
    expect(getSessionSummary(complete)).toMatchObject({
      total: 2,
      correct: 1,
      incorrect: 1,
      again: 1,
      accuracy: 50
    });
  });

  it("prevents duplicate grade submission for the same card", () => {
    const session = revealCard(createReviewSession([word("one"), word("two")]));
    const graded = gradeCurrentCard(session, "good");
    const duplicate = gradeCurrentCard({...graded, currentIndex: 0, revealed: true}, "again");

    expect(duplicate.processedIds).toEqual(["one"]);
    expect(duplicate.grades).toHaveLength(1);
  });
});

function word(id: string): Word {
  return {
    id,
    term: id,
    meaning: `${id} meaning`,
    example: `${id} example`,
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
    pronunciation: `${id} pronunciation`,
    ipa: `/${id}/`,
    exampleUkrainian: `${id} uk`
  };
}
