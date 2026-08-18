import {describe, expect, it} from "vitest";
import {scheduleNextReview} from "./scheduler";

describe("scheduleNextReview", () => {
  it("wraps the pure SRS result for existing callers", () => {
    const result = scheduleNextReview({
      rating: "again",
      state: "reviewing",
      easeFactor: 250,
      intervalDays: 5,
      repetitions: 3,
      reviewedAt: new Date("2026-08-18T12:00:00.000Z")
    });

    expect(result).toMatchObject({
      easeFactor: 230,
      intervalDays: 0,
      memoryState: "learning",
      dueOn: "2026-08-18"
    });
    expect(result.nextReviewAt.toISOString()).toBe("2026-08-18T12:10:00.000Z");
  });
});
