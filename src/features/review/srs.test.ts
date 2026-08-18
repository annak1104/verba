import {describe, expect, it} from "vitest";
import {calculateNextReview} from "./srs";

const reviewedAt = new Date("2026-08-18T12:00:00.000Z");

describe("calculateNextReview", () => {
  it("keeps missed cards in learning and schedules a short retry", () => {
    const result = calculateNextReview({
      grade: "again",
      state: "reviewing",
      reviewedAt,
      intervalDays: 5,
      ease: 250,
      correctCount: 3,
      incorrectCount: 1,
      difficulty: 2
    });

    expect(result.state).toBe("learning");
    expect(result.intervalDays).toBe(0);
    expect(result.ease).toBe(230);
    expect(result.incorrectCount).toBe(2);
    expect(result.difficulty).toBe(3);
    expect(result.nextReviewAt.toISOString()).toBe("2026-08-18T12:10:00.000Z");
  });

  it("moves a first good answer into learning for tomorrow", () => {
    const result = calculateNextReview({
      grade: "good",
      state: "new",
      reviewedAt,
      intervalDays: 0,
      ease: 250,
      correctCount: 0,
      incorrectCount: 0,
      difficulty: 3
    });

    expect(result.state).toBe("learning");
    expect(result.intervalDays).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe("2026-08-19T12:00:00.000Z");
  });

  it("promotes stable long-interval cards to mastered", () => {
    const result = calculateNextReview({
      grade: "easy",
      state: "reviewing",
      reviewedAt,
      intervalDays: 10,
      ease: 270,
      correctCount: 3,
      incorrectCount: 0,
      difficulty: 2
    });

    expect(result.state).toBe("mastered");
    expect(result.intervalDays).toBeGreaterThanOrEqual(21);
    expect(result.ease).toBe(285);
    expect(result.difficulty).toBe(1);
  });
});
