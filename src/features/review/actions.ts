"use server";

import {revalidatePath} from "next/cache";
import {applyCardReview} from "@/features/review/services/review-service";
import {
  completeLearningSession,
  startLearningSession
} from "@/features/study/services/learning-session-service";
import type {ReviewRating} from "@/features/vocabulary/types";

export async function gradeCardAction(cardId: string, rating: ReviewRating) {
  await applyCardReview(cardId, rating);
  revalidatePath("/review");
  revalidatePath("/today");
  revalidatePath("/decks");
  revalidatePath("/stats");
}

export async function startReviewSessionAction() {
  const session = await startLearningSession();
  return {sessionId: session.id};
}

export async function completeReviewSessionAction(input: {
  sessionId: string;
  newCards: number;
  reviewedCards: number;
  correctCount: number;
  incorrectCount: number;
}) {
  await completeLearningSession(input);
  revalidatePath("/today");
  revalidatePath("/stats");
}
