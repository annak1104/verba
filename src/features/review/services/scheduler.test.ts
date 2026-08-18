import {describe, expect, it} from "vitest";
import {scheduleNextReview} from "./scheduler";

describe("scheduleNextReview", () => {
  it("resets repetitions when a word is missed", () => {
    const result = scheduleNextReview({
      rating: "again",
      easeFactor: 250,
      intervalDays: 5,
      repetitions: 3,
      reviewedAt: new Date("2026-08-18T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      repetitions: 0,
      intervalDays: 0,
      memoryState: "learning",
      dueOn: "2026-08-18"
    });
  });

  it("grows the interval for an easy review", () => {
    const result = scheduleNextReview({
      rating: "easy",
      easeFactor: 250,
      intervalDays: 3,
      repetitions: 2,
      reviewedAt: new Date("2026-08-18T00:00:00.000Z")
    });

    expect(result.intervalDays).toBeGreaterThan(3);
    expect(result.easeFactor).toBe(265);
    expect(result.memoryState).toBe("reviewing");
  });
});
