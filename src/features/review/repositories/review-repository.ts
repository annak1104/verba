import {and, desc, eq} from "drizzle-orm";
import {db} from "@/db/client";
import {cards, reviewHistory, reviewState} from "@/db/schema";
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
  difficulty: number;
};

export type ApplyReviewInput = {
  ownerId: string;
  cardId: string;
  rating: ReviewRating;
  nextStatus: MemoryState;
  nextReviewAt: Date;
  nextInterval: number;
  nextEase: number;
  nextDifficulty: number;
  wasCorrect: boolean;
};

export class ReviewRepository {
  async getState(ownerId: string, cardId: string): Promise<ReviewStateRecord | null> {
    const [row] = await db
      .select({
        state: reviewState,
        difficulty: cards.difficulty
      })
      .from(reviewState)
      .innerJoin(cards, and(eq(reviewState.cardId, cards.id), eq(reviewState.ownerId, cards.ownerId)))
      .where(and(eq(reviewState.ownerId, ownerId), eq(reviewState.cardId, cardId)))
      .limit(1);

    return row ? toState(row.state, row.difficulty) : null;
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

    return db.transaction(async (tx) => {
      const [updated] = await tx
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

      if (!updated) {
        throw new Error("Failed to update review state.");
      }

      await tx
        .update(cards)
        .set({
          difficulty: Math.round(input.nextDifficulty),
          updatedAt: new Date()
        })
        .where(and(eq(cards.ownerId, input.ownerId), eq(cards.id, input.cardId)));

      await tx.insert(reviewHistory).values({
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

      return toState(updated, input.nextDifficulty);
    });
  }
}

function toState(row: typeof reviewState.$inferSelect, difficulty: number): ReviewStateRecord {
  return {
    cardId: row.cardId,
    ownerId: row.ownerId,
    status: row.status,
    nextReviewAt: row.nextReviewAt,
    interval: row.interval,
    ease: row.ease,
    correctCount: row.correctCount,
    incorrectCount: row.incorrectCount,
    difficulty
  };
}
