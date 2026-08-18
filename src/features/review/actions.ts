"use server";

import {revalidatePath} from "next/cache";
import {applyCardReview} from "@/features/review/services/review-service";
import type {ReviewRating} from "@/features/vocabulary/types";

export async function gradeCardAction(cardId: string, rating: ReviewRating) {
  await applyCardReview(cardId, rating);
  revalidatePath("/review");
  revalidatePath("/today");
  revalidatePath("/decks");
  revalidatePath("/stats");
}
