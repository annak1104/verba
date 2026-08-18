import type {MemoryState, ReviewRating} from "@/features/vocabulary/types";

export type ScheduleInput = {
  rating: ReviewRating;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  reviewedAt: Date;
};

export type ScheduleResult = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  memoryState: MemoryState;
  dueOn: string;
};

const ratingEaseDelta: Record<ReviewRating, number> = {
  again: -20,
  hard: -10,
  good: 0,
  easy: 15
};

export function scheduleNextReview(input: ScheduleInput): ScheduleResult {
  const easeFactor = Math.max(130, input.easeFactor + ratingEaseDelta[input.rating]);
  const repetitions = input.rating === "again" ? 0 : input.repetitions + 1;
  const intervalDays = nextInterval(input.rating, input.intervalDays, repetitions, easeFactor);
  const due = new Date(input.reviewedAt);
  due.setUTCDate(due.getUTCDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    memoryState: toMemoryState(repetitions, intervalDays),
    dueOn: due.toISOString().slice(0, 10)
  };
}

function nextInterval(
  rating: ReviewRating,
  currentInterval: number,
  repetitions: number,
  easeFactor: number
) {
  if (rating === "again") {
    return 0;
  }

  if (repetitions <= 1) {
    return rating === "easy" ? 3 : 1;
  }

  if (rating === "hard") {
    return Math.max(1, Math.round(currentInterval * 1.2));
  }

  const multiplier = rating === "easy" ? (easeFactor + 30) / 100 : easeFactor / 100;
  return Math.max(1, Math.round(Math.max(currentInterval, 1) * multiplier));
}

function toMemoryState(repetitions: number, intervalDays: number): MemoryState {
  if (repetitions === 0) {
    return "learning";
  }

  if (intervalDays >= 14) {
    return "mastered";
  }

  if (repetitions >= 2) {
    return "reviewing";
  }

  return "learning";
}
