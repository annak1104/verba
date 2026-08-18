export type SrsState = "new" | "learning" | "reviewing" | "mastered";
export type SrsGrade = "again" | "hard" | "good" | "easy";

export type SrsInput = {
  grade: SrsGrade;
  state: SrsState;
  reviewedAt: Date;
  intervalDays: number;
  ease: number;
  correctCount: number;
  incorrectCount: number;
  difficulty: number;
};

export type SrsResult = {
  state: SrsState;
  nextReviewAt: Date;
  intervalDays: number;
  ease: number;
  correctCount: number;
  incorrectCount: number;
  difficulty: number;
};

const easeDelta: Record<SrsGrade, number> = {
  again: -20,
  hard: -10,
  good: 0,
  easy: 15
};

export function calculateNextReview(input: SrsInput): SrsResult {
  const wasCorrect = input.grade !== "again";
  const correctCount = input.correctCount + (wasCorrect ? 1 : 0);
  const incorrectCount = input.incorrectCount + (wasCorrect ? 0 : 1);
  const ease = clamp(input.ease + easeDelta[input.grade], 130, 320);
  const intervalDays = getNextIntervalDays({...input, ease, correctCount});
  const state = getNextState({...input, intervalDays, correctCount});
  const difficulty = getNextDifficulty(input.difficulty, input.grade);
  const nextReviewAt = addReviewDelay(input.reviewedAt, input.grade, intervalDays);

  return {
    state,
    nextReviewAt,
    intervalDays,
    ease,
    correctCount,
    incorrectCount,
    difficulty
  };
}

function getNextIntervalDays(
  input: SrsInput & {
    ease: number;
    correctCount: number;
  }
) {
  if (input.grade === "again") {
    return 0;
  }

  if (input.grade === "hard") {
    return Math.max(input.state === "new" ? 0 : 1, Math.round(input.intervalDays * 1.15));
  }

  if (input.state === "new" || input.intervalDays === 0) {
    return input.grade === "easy" ? 3 : 1;
  }

  const multiplier = input.grade === "easy" ? (input.ease + 35) / 100 : input.ease / 100;
  return Math.max(1, Math.round(input.intervalDays * multiplier));
}

function getNextState(
  input: SrsInput & {
    intervalDays: number;
    correctCount: number;
  }
): SrsState {
  if (input.grade === "again") {
    return "learning";
  }

  if (input.intervalDays >= 21 && input.correctCount >= 4) {
    return "mastered";
  }

  if (input.intervalDays >= 2 || input.correctCount >= 2) {
    return "reviewing";
  }

  return "learning";
}

function getNextDifficulty(current: number, grade: SrsGrade) {
  if (grade === "again") {
    return clamp(current + 1, 1, 5);
  }

  if (grade === "hard") {
    return clamp(current + 0.5, 1, 5);
  }

  if (grade === "easy") {
    return clamp(current - 1, 1, 5);
  }

  return clamp(current - 0.25, 1, 5);
}

function addReviewDelay(reviewedAt: Date, grade: SrsGrade, intervalDays: number) {
  const next = new Date(reviewedAt);

  if (grade === "again") {
    next.setUTCMinutes(next.getUTCMinutes() + 10);
    return next;
  }

  if (grade === "hard" && intervalDays === 0) {
    next.setUTCHours(next.getUTCHours() + 6);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + intervalDays);
  return next;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
