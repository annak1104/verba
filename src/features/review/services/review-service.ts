import {auth} from "@clerk/nextjs/server";
import {scheduleNextReview} from "@/features/review/services/scheduler";
import type {ReviewRating} from "@/features/vocabulary/types";
import {getDueWords} from "@/features/vocabulary/services/vocabulary-service";

export async function getDueReview() {
  const [first] = await getDueWords();
  return first ?? null;
}

export async function applyCardReview(cardId: string, rating: ReviewRating) {
  const {userId} = await auth.protect();

  const {ReviewRepository} = await import("@/features/review/repositories/review-repository");
  const repository = new ReviewRepository();
  const current = await repository.getState(userId, cardId);

  if (!current) {
    throw new Error("Review state not found.");
  }

  const next = scheduleNextReview({
    rating,
    state: current.status,
    easeFactor: current.ease,
    intervalDays: current.interval,
    repetitions: current.correctCount + current.incorrectCount,
    correctCount: current.correctCount,
    incorrectCount: current.incorrectCount,
    difficulty: current.difficulty,
    reviewedAt: new Date()
  });

  return repository.applyReview({
    ownerId: userId,
    cardId,
    rating,
    nextStatus: next.memoryState,
    nextReviewAt: next.nextReviewAt,
    nextInterval: next.intervalDays,
    nextEase: next.easeFactor,
    nextDifficulty: next.difficulty,
    wasCorrect: rating !== "again"
  });
}
