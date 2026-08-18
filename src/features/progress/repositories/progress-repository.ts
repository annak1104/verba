import {and, asc, desc, eq, gte, lt, lte, ne, sql} from "drizzle-orm";
import {db} from "@/db/client";
import {cards, decks, reviewHistory, reviewState} from "@/db/schema";
import type {Deck, MemoryState, StudyQueueItem} from "@/features/vocabulary/types";

export type ActivityDay = {
  date: string;
  reviews: number;
  correct: number;
  newWords: number;
  total: number;
};

export type CardStatusCounts = Record<MemoryState, number> & {
  total: number;
};

export type TodaySummary = {
  newWords: number;
  reviews: number;
  correct: number;
  accuracy: number;
  totalActivity: number;
};

export type DashboardSummary = {
  streakDays: number;
  dailyGoal: number;
  dailyProgress: number;
  dailyCompleted: number;
  newWords: number;
  dueReviews: number;
  mastered: number;
  queue: StudyQueueItem[];
  recentDecks: Deck[];
  todaySummary: TodaySummary;
};

export type ProgressStats = {
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalVocabulary: number;
  statusCounts: CardStatusCounts;
  dailyGoal: number;
  dailyGoalCompletion: number;
  activity: {
    sevenDays: number;
    thirtyDays: number;
    allTime: number;
    heatmap: ActivityDay[];
  };
  deckProgress: Deck[];
};

export class ProgressRepository {
  async getStatusCounts(userId: string): Promise<CardStatusCounts> {
    const [row] = await db
      .select({
        total: sql<number>`cast(count(${cards.id}) as integer)`,
        newCount: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'new') as integer)`,
        learning: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'learning') as integer)`,
        reviewing: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'reviewing') as integer)`,
        mastered: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'mastered') as integer)`
      })
      .from(cards)
      .leftJoin(
        reviewState,
        and(eq(cards.id, reviewState.cardId), eq(cards.ownerId, reviewState.ownerId))
      )
      .where(eq(cards.ownerId, userId));

    return {
      total: asNumber(row?.total),
      new: asNumber(row?.newCount),
      learning: asNumber(row?.learning),
      reviewing: asNumber(row?.reviewing),
      mastered: asNumber(row?.mastered)
    };
  }

  async getDueReviewCount(userId: string, now: Date): Promise<number> {
    const [row] = await db
      .select({count: sql<number>`cast(count(*) as integer)`})
      .from(reviewState)
      .where(
        and(
          eq(reviewState.ownerId, userId),
          ne(reviewState.status, "new"),
          lte(reviewState.nextReviewAt, now)
        )
      );

    return asNumber(row?.count);
  }

  async getQueue(userId: string, now: Date, limit = 5): Promise<StudyQueueItem[]> {
    const rows = await db
      .select({
        id: cards.id,
        term: cards.english,
        meaning: cards.ukrainianTranslation,
        deckName: decks.name,
        memoryState: reviewState.status
      })
      .from(cards)
      .innerJoin(decks, and(eq(cards.deckId, decks.id), eq(cards.ownerId, decks.ownerId)))
      .innerJoin(
        reviewState,
        and(eq(cards.id, reviewState.cardId), eq(cards.ownerId, reviewState.ownerId))
      )
      .where(and(eq(cards.ownerId, userId), lte(reviewState.nextReviewAt, now)))
      .orderBy(asc(reviewState.nextReviewAt), asc(cards.english))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      term: row.term,
      meaning: row.meaning,
      deckName: row.deckName,
      memoryState: row.memoryState,
      kind: row.memoryState === "new" ? "new" : "review"
    }));
  }

  async getDeckProgress(userId: string, limit?: number): Promise<Deck[]> {
    const rows = await db
      .select({
        id: decks.id,
        name: decks.name,
        description: decks.description,
        color: decks.color,
        position: decks.position,
        updatedAt: decks.updatedAt,
        wordCount: sql<number>`cast(count(${cards.id}) as integer)`,
        dueCount: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.nextReviewAt} <= now()) as integer)`,
        learningCount: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'learning') as integer)`,
        masteredCount: sql<number>`cast(count(${cards.id}) filter (where ${reviewState.status} = 'mastered') as integer)`
      })
      .from(decks)
      .leftJoin(cards, and(eq(decks.id, cards.deckId), eq(decks.ownerId, cards.ownerId)))
      .leftJoin(
        reviewState,
        and(eq(cards.id, reviewState.cardId), eq(cards.ownerId, reviewState.ownerId))
      )
      .where(eq(decks.ownerId, userId))
      .groupBy(
        decks.id,
        decks.name,
        decks.description,
        decks.color,
        decks.position,
        decks.updatedAt
      )
      .orderBy(limit == null ? asc(decks.position) : desc(decks.updatedAt), asc(decks.name))
      .limit(limit ?? 100);

    return rows.map((row) => toDeck(row));
  }

  async getTodaySummary(userId: string, start: Date, end: Date): Promise<TodaySummary> {
    const [reviewsRow, newWordsRow] = await Promise.all([
      db
        .select({
          reviews: sql<number>`cast(count(*) as integer)`,
          correct: sql<number>`cast(count(*) filter (where ${reviewHistory.rating} <> 'again') as integer)`
        })
        .from(reviewHistory)
        .where(
          and(
            eq(reviewHistory.ownerId, userId),
            gte(reviewHistory.reviewedAt, start),
            lt(reviewHistory.reviewedAt, end)
          )
        ),
      db
        .select({newWords: sql<number>`cast(count(*) as integer)`})
        .from(cards)
        .where(and(eq(cards.ownerId, userId), gte(cards.createdAt, start), lt(cards.createdAt, end)))
    ]);

    const reviews = asNumber(reviewsRow[0]?.reviews);
    const correct = asNumber(reviewsRow[0]?.correct);
    const newWords = asNumber(newWordsRow[0]?.newWords);

    return {
      reviews,
      correct,
      newWords,
      accuracy: percent(correct, reviews),
      totalActivity: reviews + newWords
    };
  }

  async getActivity(userId: string, from?: Date): Promise<ActivityDay[]> {
    const reviewDay = sql<string>`date(${reviewHistory.reviewedAt})`;
    const cardDay = sql<string>`date(${cards.createdAt})`;
    const reviewWhere = from
      ? and(eq(reviewHistory.ownerId, userId), gte(reviewHistory.reviewedAt, from))
      : eq(reviewHistory.ownerId, userId);
    const cardWhere = from
      ? and(eq(cards.ownerId, userId), gte(cards.createdAt, from))
      : eq(cards.ownerId, userId);

    const [reviewRows, newWordRows] = await Promise.all([
      db
        .select({
          day: reviewDay,
          reviews: sql<number>`cast(count(*) as integer)`,
          correct: sql<number>`cast(count(*) filter (where ${reviewHistory.rating} <> 'again') as integer)`
        })
        .from(reviewHistory)
        .where(reviewWhere)
        .groupBy(reviewDay),
      db
        .select({
          day: cardDay,
          newWords: sql<number>`cast(count(*) as integer)`
        })
        .from(cards)
        .where(cardWhere)
        .groupBy(cardDay)
    ]);

    const activity = new Map<string, ActivityDay>();
    for (const row of reviewRows) {
      const date = toDateKey(row.day);
      const current = ensureActivityDay(activity, date);
      current.reviews += asNumber(row.reviews);
      current.correct += asNumber(row.correct);
      current.total = current.reviews + current.newWords;
    }

    for (const row of newWordRows) {
      const date = toDateKey(row.day);
      const current = ensureActivityDay(activity, date);
      current.newWords += asNumber(row.newWords);
      current.total = current.reviews + current.newWords;
    }

    return [...activity.values()].sort((left, right) => left.date.localeCompare(right.date));
  }
}

function ensureActivityDay(activity: Map<string, ActivityDay>, date: string) {
  const existing = activity.get(date);
  if (existing) return existing;

  const next = {date, reviews: 0, correct: 0, newWords: 0, total: 0};
  activity.set(date, next);
  return next;
}

function toDeck(row: {
  id: string;
  name: string;
  description: string | null;
  color: string;
  position: number;
  wordCount: number;
  dueCount: number;
  learningCount: number;
  masteredCount: number;
}): Deck {
  const wordCount = asNumber(row.wordCount);
  const masteredCount = asNumber(row.masteredCount);

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    color: toDeckColor(row.color),
    position: row.position,
    wordCount,
    dueCount: asNumber(row.dueCount),
    learningCount: asNumber(row.learningCount),
    masteredCount,
    progress: wordCount === 0 ? 0 : percent(masteredCount, wordCount)
  };
}

function toDeckColor(color: string): Deck["color"] {
  if (color === "cyan" || color === "amber" || color === "rose") {
    return color;
  }

  return "emerald";
}

export function percent(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export function toDateKey(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function asNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}
