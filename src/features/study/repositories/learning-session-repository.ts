import {and, desc, eq, isNull} from "drizzle-orm";
import {db} from "@/db/client";
import {learningSessions} from "@/db/schema";

export type CompleteLearningSessionInput = {
  sessionId: string;
  ownerId: string;
  newCards: number;
  reviewedCards: number;
  correctCount: number;
  incorrectCount: number;
};

export class LearningSessionRepository {
  async startOrResume(ownerId: string) {
    const open = await db.query.learningSessions.findFirst({
      where: and(eq(learningSessions.ownerId, ownerId), isNull(learningSessions.completedAt)),
      orderBy: desc(learningSessions.startedAt)
    });

    if (open) {
      return open;
    }

    return this.start(ownerId);
  }

  async start(ownerId: string) {
    const [row] = await db.insert(learningSessions).values({ownerId}).returning();

    if (!row) {
      throw new Error("Failed to start learning session.");
    }

    return row;
  }

  async complete(input: CompleteLearningSessionInput) {
    const [row] = await db
      .update(learningSessions)
      .set({
        completedAt: new Date(),
        newCards: input.newCards,
        reviewedCards: input.reviewedCards,
        correctCount: input.correctCount,
        incorrectCount: input.incorrectCount
      })
      .where(
        and(eq(learningSessions.ownerId, input.ownerId), eq(learningSessions.id, input.sessionId))
      )
      .returning();

    if (!row) {
      throw new Error("Learning session not found.");
    }

    return row;
  }

  async recent(ownerId: string, limit = 20) {
    return db.query.learningSessions.findMany({
      where: eq(learningSessions.ownerId, ownerId),
      orderBy: desc(learningSessions.startedAt),
      limit
    });
  }
}
