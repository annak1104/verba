import {describe, expect, it} from "vitest";
import {
  FLASHCARD_BACK_SCROLL_CLASS,
  FLASHCARD_CARD_CLASS
} from "@/features/review/flashcard-layout";

describe("flashcard layout", () => {
  it("keeps a fixed card size and scrolls answer content internally", () => {
    expect(FLASHCARD_CARD_CLASS).toContain("h-[28rem]");
    expect(FLASHCARD_CARD_CLASS).toContain("sm:h-[32rem]");
    expect(FLASHCARD_BACK_SCROLL_CLASS).toContain("overflow-y-auto");
  });
});
