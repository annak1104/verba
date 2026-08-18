import {and, asc, desc, eq, lte, sql} from "drizzle-orm";
import {db} from "@/db/client";
import {cardTags, cards, decks, reviewState, tags} from "@/db/schema";
import type {
  CardFilters,
  CreateCardInput,
  CreateDeckInput,
  Deck,
  UpdateCardInput,
  UpdateDeckInput,
  Word
} from "@/features/vocabulary/types";

export type VocabularyRepository = {
  ensureDefaultDeck(userId: string): Promise<Deck>;
  listDecks(userId: string): Promise<Deck[]>;
  listWords(userId: string, filters?: CardFilters): Promise<Word[]>;
  listDueWords(userId: string, isoDate: string): Promise<Word[]>;
  listTags(userId: string): Promise<Array<{id: string; name: string; color: string}>>;
  createDeck(userId: string, input: CreateDeckInput): Promise<Deck>;
  updateDeck(userId: string, input: UpdateDeckInput): Promise<Deck>;
  deleteDeck(userId: string, deckId: string): Promise<void>;
  moveDeck(userId: string, deckId: string, direction: "up" | "down"): Promise<void>;
  createCard(userId: string, input: CreateCardInput): Promise<Word>;
  updateCard(userId: string, input: UpdateCardInput): Promise<Word>;
  deleteCard(userId: string, cardId: string): Promise<void>;
  toggleFavorite(userId: string, cardId: string): Promise<void>;
};

type CardRow = typeof cards.$inferSelect & {
  deck: {name: string};
  reviewState: typeof reviewState.$inferSelect | null;
  tags?: Array<{id: string; name: string; color: string}>;
};

export class DrizzleVocabularyRepository implements VocabularyRepository {
  async ensureDefaultDeck(userId: string): Promise<Deck> {
    const existing = await db.query.decks.findFirst({
      where: and(eq(decks.ownerId, userId), eq(decks.name, "Default")),
      with: {cards: {with: {reviewState: true}}}
    });

    if (existing) {
      return toDeck(existing);
    }

    return this.createDeck(userId, {
      name: "Default",
      description: "Your first English vocabulary deck.",
      color: "emerald"
    });
  }

  async listDecks(userId: string): Promise<Deck[]> {
    const rows = await db.query.decks.findMany({
      where: eq(decks.ownerId, userId),
      with: {
        cards: {
          with: {
            reviewState: true
          }
        }
      },
      orderBy: [asc(decks.position), asc(decks.name)]
    });

    return rows.map(toDeck);
  }

  async listWords(userId: string, filters: CardFilters = {}): Promise<Word[]> {
    const rows = await db.query.cards.findMany({
      where: eq(cards.ownerId, userId),
      with: {
        deck: true,
        reviewState: true
      },
      orderBy: orderCardsBy(filters.sort)
    });

    const tagMap = await this.getTagsByCardId(userId);
    const words = rows
      .map((row) => toWord({...row, tags: tagMap.get(row.id) ?? []}))
      .filter((word) => matchesFilters(word, filters));

    if (filters.sort === "due") {
      return words.sort((a, b) => a.dueOn.localeCompare(b.dueOn));
    }

    return words;
  }

  async listDueWords(userId: string, isoDate: string): Promise<Word[]> {
    const dueAt = new Date(`${isoDate}T23:59:59.999Z`);
    const rows = await db
      .select({
        card: cards,
        deckName: decks.name,
        state: reviewState
      })
      .from(cards)
      .innerJoin(decks, and(eq(cards.deckId, decks.id), eq(cards.ownerId, decks.ownerId)))
      .innerJoin(
        reviewState,
        and(eq(cards.id, reviewState.cardId), eq(cards.ownerId, reviewState.ownerId))
      )
      .where(and(eq(cards.ownerId, userId), lte(reviewState.nextReviewAt, dueAt)))
      .orderBy(asc(reviewState.nextReviewAt), asc(cards.english));

    const tagMap = await this.getTagsByCardId(userId);
    return rows.map(({card, deckName, state}) =>
      toWord({
        ...card,
        deck: {name: deckName},
        reviewState: state,
        tags: tagMap.get(card.id) ?? []
      })
    );
  }

  async listTags(userId: string) {
    return db.query.tags.findMany({
      where: eq(tags.ownerId, userId),
      orderBy: asc(tags.name)
    });
  }

  async createDeck(userId: string, input: CreateDeckInput): Promise<Deck> {
    const [positionRow] = await db
      .select({nextPosition: sql<number>`coalesce(max(${decks.position}), -1) + 1`})
      .from(decks)
      .where(eq(decks.ownerId, userId));

    const [created] = await db
      .insert(decks)
      .values({
        ownerId: userId,
        name: input.name,
        description: input.description,
        color: input.color ?? "emerald",
        position: positionRow?.nextPosition ?? 0
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create deck.");
    }

    return toDeck({...created, cards: []});
  }

  async updateDeck(userId: string, input: UpdateDeckInput): Promise<Deck> {
    const [updated] = await db
      .update(decks)
      .set({
        ...(input.name ? {name: input.name} : {}),
        ...(input.description !== undefined ? {description: input.description} : {}),
        ...(input.color ? {color: input.color} : {}),
        updatedAt: new Date()
      })
      .where(and(eq(decks.ownerId, userId), eq(decks.id, input.id)))
      .returning();

    if (!updated) {
      throw new Error("Deck not found.");
    }

    return toDeck({...updated, cards: []});
  }

  async deleteDeck(userId: string, deckId: string): Promise<void> {
    const allDecks = await this.listDecks(userId);
    if (allDecks.length <= 1) {
      throw new Error("Keep at least one deck.");
    }

    await db.delete(decks).where(and(eq(decks.ownerId, userId), eq(decks.id, deckId)));
  }

  async moveDeck(userId: string, deckId: string, direction: "up" | "down"): Promise<void> {
    const rows = await db.query.decks.findMany({
      where: eq(decks.ownerId, userId),
      orderBy: [asc(decks.position), asc(decks.name)]
    });
    const index = rows.findIndex((deck) => deck.id === deckId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || swapIndex < 0 || swapIndex >= rows.length) {
      return;
    }

    const current = rows[index];
    const swap = rows[swapIndex];
    if (!current || !swap) {
      return;
    }

    await Promise.all([
      db
        .update(decks)
        .set({position: swap.position, updatedAt: new Date()})
        .where(and(eq(decks.ownerId, userId), eq(decks.id, current.id))),
      db
        .update(decks)
        .set({position: current.position, updatedAt: new Date()})
        .where(and(eq(decks.ownerId, userId), eq(decks.id, swap.id)))
    ]);
  }

  async createCard(userId: string, input: CreateCardInput): Promise<Word> {
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.ownerId, userId), eq(decks.id, input.deckId))
    });

    if (!deck) {
      throw new Error("Deck not found.");
    }

    const [created] = await db
      .insert(cards)
      .values(cardValues(userId, input))
      .returning();

    if (!created) {
      throw new Error("Failed to create card.");
    }

    const [state] = await db
      .insert(reviewState)
      .values({
        ownerId: userId,
        cardId: created.id
      })
      .returning();

    const nextTags = await this.replaceCardTags(userId, created.id, input.tags ?? []);
    return toWord({...created, deck: {name: deck.name}, reviewState: state ?? null, tags: nextTags});
  }

  async updateCard(userId: string, input: UpdateCardInput): Promise<Word> {
    const existing = await db.query.cards.findFirst({
      where: and(eq(cards.ownerId, userId), eq(cards.id, input.id)),
      with: {deck: true, reviewState: true}
    });

    if (!existing) {
      throw new Error("Card not found.");
    }

    if (input.deckId) {
      const deck = await db.query.decks.findFirst({
        where: and(eq(decks.ownerId, userId), eq(decks.id, input.deckId))
      });

      if (!deck) {
        throw new Error("Deck not found.");
      }
    }

    const [updated] = await db
      .update(cards)
      .set({
        ...(input.deckId ? {deckId: input.deckId} : {}),
        ...(input.english ? {english: input.english} : {}),
        ...(input.ukrainianTranslation ? {ukrainianTranslation: input.ukrainianTranslation} : {}),
        ...(input.ukrainianPronunciation
          ? {ukrainianPronunciation: input.ukrainianPronunciation}
          : {}),
        ...(input.ipa !== undefined ? {ipa: input.ipa} : {}),
        ...(input.exampleEnglish !== undefined ? {exampleEnglish: input.exampleEnglish} : {}),
        ...(input.exampleUkrainian !== undefined ? {exampleUkrainian: input.exampleUkrainian} : {}),
        ...(input.notes !== undefined ? {notes: input.notes} : {}),
        ...(input.favorite !== undefined ? {favorite: input.favorite} : {}),
        ...(input.difficulty !== undefined ? {difficulty: input.difficulty} : {}),
        updatedAt: new Date()
      })
      .where(and(eq(cards.ownerId, userId), eq(cards.id, input.id)))
      .returning();

    if (!updated) {
      throw new Error("Card not found.");
    }

    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.ownerId, userId), eq(decks.id, updated.deckId))
    });
    const nextTags =
      input.tags === undefined
        ? ((await this.getTagsByCardId(userId)).get(updated.id) ?? [])
        : await this.replaceCardTags(userId, updated.id, input.tags);

    return toWord({
      ...updated,
      deck: {name: deck?.name ?? existing.deck.name},
      reviewState: existing.reviewState,
      tags: nextTags
    });
  }

  async deleteCard(userId: string, cardId: string): Promise<void> {
    await db.delete(cards).where(and(eq(cards.ownerId, userId), eq(cards.id, cardId)));
  }

  async toggleFavorite(userId: string, cardId: string): Promise<void> {
    const existing = await db.query.cards.findFirst({
      where: and(eq(cards.ownerId, userId), eq(cards.id, cardId))
    });

    if (!existing) {
      throw new Error("Card not found.");
    }

    await db
      .update(cards)
      .set({favorite: !existing.favorite, updatedAt: new Date()})
      .where(and(eq(cards.ownerId, userId), eq(cards.id, cardId)));
  }

  private async getTagsByCardId(userId: string) {
    const rows = await db
      .select({
        cardId: cardTags.cardId,
        tag: tags
      })
      .from(cardTags)
      .innerJoin(tags, and(eq(cardTags.tagId, tags.id), eq(cardTags.ownerId, tags.ownerId)))
      .where(eq(cardTags.ownerId, userId))
      .orderBy(asc(tags.name));

    const tagMap = new Map<string, Array<{id: string; name: string; color: string}>>();
    for (const row of rows) {
      const list = tagMap.get(row.cardId) ?? [];
      list.push(row.tag);
      tagMap.set(row.cardId, list);
    }

    return tagMap;
  }

  private async replaceCardTags(userId: string, cardId: string, tagNames: string[]) {
    const normalized = normalizeTags(tagNames);
    await db.delete(cardTags).where(and(eq(cardTags.ownerId, userId), eq(cardTags.cardId, cardId)));

    if (normalized.length === 0) {
      return [];
    }

    const tagRows = [];
    for (const name of normalized) {
      const [tag] = await db
        .insert(tags)
        .values({ownerId: userId, name})
        .onConflictDoUpdate({
          target: [tags.ownerId, tags.name],
          set: {updatedAt: new Date()}
        })
        .returning();

      if (tag) {
        tagRows.push(tag);
      }
    }

    if (tagRows.length > 0) {
      await db.insert(cardTags).values(
        tagRows.map((tag) => ({
          ownerId: userId,
          cardId,
          tagId: tag.id
        }))
      );
    }

    return tagRows.map((tag) => ({id: tag.id, name: tag.name, color: tag.color}));
  }
}

function cardValues(userId: string, input: CreateCardInput): typeof cards.$inferInsert {
  return {
    ownerId: userId,
    deckId: input.deckId,
    english: input.english,
    ukrainianTranslation: input.ukrainianTranslation,
    ukrainianPronunciation: input.ukrainianPronunciation,
    ...(input.ipa ? {ipa: input.ipa} : {}),
    ...(input.exampleEnglish ? {exampleEnglish: input.exampleEnglish} : {}),
    ...(input.exampleUkrainian ? {exampleUkrainian: input.exampleUkrainian} : {}),
    ...(input.notes ? {notes: input.notes} : {}),
    favorite: input.favorite ?? false,
    difficulty: input.difficulty ?? 1
  };
}

function toDeck(row: typeof decks.$inferSelect & {cards: Array<{reviewState: typeof reviewState.$inferSelect | null}>}): Deck {
  const now = new Date();
  const total = row.cards.length;
  const dueCount = row.cards.filter((card) => card.reviewState && card.reviewState.nextReviewAt <= now).length;
  const learningCount = row.cards.filter((card) => card.reviewState?.status === "learning").length;
  const masteredCount = row.cards.filter((card) => card.reviewState?.status === "mastered").length;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    color: toDeckColor(row.color),
    position: row.position,
    wordCount: total,
    dueCount,
    learningCount,
    masteredCount,
    progress: total === 0 ? 0 : Math.round((masteredCount / total) * 100)
  };
}

function toWord(row: CardRow): Word {
  const state = row.reviewState;
  const word: Word = {
    id: row.id,
    term: row.english,
    meaning: row.ukrainianTranslation,
    example: row.exampleEnglish ?? "",
    exampleUkrainian: row.exampleUkrainian ?? "",
    notes: row.notes ?? "",
    favorite: row.favorite,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    deckId: row.deckId,
    deckName: row.deck.name,
    memoryState: state?.status ?? "new",
    easeFactor: state?.ease ?? 250,
    intervalDays: state?.interval ?? 0,
    repetitions: (state?.correctCount ?? 0) + (state?.incorrectCount ?? 0),
    dueOn: (state?.nextReviewAt ?? new Date()).toISOString().slice(0, 10)
  };

  if (row.ukrainianPronunciation) {
    word.pronunciation = row.ukrainianPronunciation;
  }

  if (row.ipa) {
    word.ipa = row.ipa;
  }

  return word;
}

function matchesFilters(word: Word, filters: CardFilters) {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = [
      word.term,
      word.meaning,
      word.pronunciation,
      word.ipa,
      word.example,
      word.exampleUkrainian,
      word.notes,
      ...word.tags.map((tag) => tag.name)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.deckId && word.deckId !== filters.deckId) {
    return false;
  }

  if (filters.status && filters.status !== "all" && word.memoryState !== filters.status) {
    return false;
  }

  if (filters.favorite === "true" && !word.favorite) {
    return false;
  }

  if (filters.tag && !word.tags.some((tag) => tag.name === filters.tag)) {
    return false;
  }

  return true;
}

function orderCardsBy(sort: CardFilters["sort"]) {
  if (sort === "created") {
    return desc(cards.createdAt);
  }

  if (sort === "difficulty") {
    return desc(cards.difficulty);
  }

  return asc(cards.english);
}

function normalizeTags(tagNames: string[]) {
  return [...new Set(tagNames.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 12);
}

function toDeckColor(color: string): Deck["color"] {
  if (color === "cyan" || color === "amber" || color === "rose") {
    return color;
  }

  return "emerald";
}
