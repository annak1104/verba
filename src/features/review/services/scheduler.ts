import {calculateNextReview} from "@/features/review/srs";
import type {MemoryState, ReviewRating} from "@/features/vocabulary/types";

export type ScheduleInput = {
  rating: ReviewRating;
  state?: MemoryState;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  correctCount?: number;
  incorrectCount?: number;
  difficulty?: number;
  reviewedAt: Date;
};

export type ScheduleResult = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  memoryState: MemoryState;
  nextReviewAt: Date;
  difficulty: number;
  dueOn: string;
};

export function scheduleNextReview(input: ScheduleInput): ScheduleResult {
  const correctCount = input.correctCount ?? input.repetitions;
  const incorrectCount = input.incorrectCount ?? 0;
  const next = calculateNextReview({
    grade: input.rating,
    state: input.state ?? "new",
    ease: input.easeFactor,
    intervalDays: input.intervalDays,
    correctCount,
    incorrectCount,
    difficulty: input.difficulty ?? 1,
    reviewedAt: input.reviewedAt
  });

  return {
    easeFactor: next.ease,
    intervalDays: next.intervalDays,
    repetitions: next.correctCount + next.incorrectCount,
    memoryState: next.state,
    nextReviewAt: next.nextReviewAt,
    difficulty: next.difficulty,
    dueOn: next.nextReviewAt.toISOString().slice(0, 10)
  };
}
