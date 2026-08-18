import {and, desc, eq} from "drizzle-orm";
import {db} from "@/db/client";
import {reviewHistory, reviewState} from "@/db/schema";
import type {MemoryState, ReviewRating} from "@/features/vocabulary/types";

export type ReviewStateRecord = {
  cardId: string;
  ownerId: string;
  status: MemoryState;
  nextReviewAt: Date;
  interval: number;
  ease: number;
  correctCount: number;
  incorrectCount: number;
};

export type ApplyReviewInput = {
  ownerId: string;
  cardId: string;
  rating: ReviewRating;
  nextStatus: MemoryState;
  nextReviewAt: Date;
  nextInterval: number;
  nextEase: number;
  wasCorrect: boolean;
};

export class ReviewRepository {
  async getState(ownerId: string, cardId: string): Promise<ReviewStateRecord | null> {
    const row = await db.query.reviewState.findFirst({
      where: and(eq(reviewState.ownerId, ownerId), eq(reviewState.cardId, cardId))
    });

    return row ? toState(row) : null;
  }

  async listHistory(ownerId: string, cardId: string) {
    return db.query.reviewHistory.findMany({
      where: and(eq(reviewHistory.ownerId, ownerId), eq(reviewHistory.cardId, cardId)),
      orderBy: desc(reviewHistory.reviewedAt),
      limit: 50
    });
  }

  async applyReview(input: ApplyReviewInput): Promise<ReviewStateRecord> {
    const current = await this.getState(input.ownerId, input.cardId);
    if (!current) {
      throw new Error("Review state not found.");
    }

    const [updated] = await db
      .update(reviewState)
      .set({
        status: input.nextStatus,
        nextReviewAt: input.nextReviewAt,
        interval: input.nextInterval,
        ease: input.nextEase,
        correctCount: current.correctCount + (input.wasCorrect ? 1 : 0),
        incorrectCount: current.incorrectCount + (input.wasCorrect ? 0 : 1),
        updatedAt: new Date()
      })
      .where(and(eq(reviewState.ownerId, input.ownerId), eq(reviewState.cardId, input.cardId)))
      .returning();

    await db.insert(reviewHistory).values({
      ownerId: input.ownerId,
      cardId: input.cardId,
      rating: input.rating,
      previousStatus: current.status,
      nextStatus: input.nextStatus,
      previousInterval: current.interval,
      nextInterval: input.nextInterval,
      previousEase: current.ease,
      nextEase: input.nextEase
    });

    if (!updated) {
      throw new Error("Failed to update review state.");
    }

    return toState(updated);
  }
}

function toState(row: typeof reviewState.$inferSelect): ReviewStateRecord {
  return {
    cardId: row.cardId,
    ownerId: row.ownerId,
    status: row.status,
    nextReviewAt: row.nextReviewAt,
    interval: row.interval,
    ease: row.ease,
    correctCount: row.correctCount,
    incorrectCount: row.incorrectCount
  };
}
