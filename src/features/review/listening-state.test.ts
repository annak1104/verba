import {describe, expect, it} from "vitest";
import {
  createListeningState,
  getListeningCard,
  getListeningProgress,
  goToNextListeningCard,
  revealListeningAnswer
} from "@/features/review/listening-state";
import type {Word} from "@/features/vocabulary/types";

describe("listening practice state", () => {
  it("advances reliably through every card", () => {
    const first = createListeningState([word("one"), word("two")]);
    const second = goToNextListeningCard(first);
    const wrapped = goToNextListeningCard(second);

    expect(getListeningCard(first)?.id).toBe("one");
    expect(getListeningCard(second)?.id).toBe("two");
    expect(getListeningCard(wrapped)?.id).toBe("one");
    expect(getListeningProgress(second)).toEqual({current: 2, total: 2});
  });

  it("reveal shows the answer state and next hides it again", () => {
    const revealed = revealListeningAnswer(createListeningState([word("one"), word("two")]));
    const next = goToNextListeningCard(revealed);

    expect(revealed.revealed).toBe(true);
    expect(next.revealed).toBe(false);
  });
});

function word(id: string): Word {
  return {
    id,
    term: id,
    meaning: `${id} meaning`,
    example: "",
    favorite: false,
    difficulty: 1,
    tags: [],
    deckId: "deck",
    deckName: "Deck",
    memoryState: "new",
    easeFactor: 250,
    intervalDays: 0,
    repetitions: 0,
    dueOn: "2026-08-18"
  };
}
