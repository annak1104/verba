import {relations} from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const reviewRatingEnum = pgEnum("review_rating", ["again", "hard", "good", "easy"]);
export const reviewStatusEnum = pgEnum("review_status", [
  "new",
  "learning",
  "reviewing",
  "mastered"
]);
export const learningDirectionEnum = pgEnum("learning_direction", [
  "english_to_ukrainian",
  "ukrainian_to_english",
  "mixed"
]);
export const themePreferenceEnum = pgEnum("theme_preference", ["light", "dark", "system"]);
export const englishLevelEnum = pgEnum("english_level", [
  "beginner",
  "elementary",
  "intermediate",
  "advanced"
]);
export const pronunciationPreferenceEnum = pgEnum("pronunciation_preference", [
  "ukrainian",
  "ipa",
  "both"
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: varchar("clerk_user_id", {length: 128}).notNull().unique(),
    email: varchar("email", {length: 320}),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    index("users_clerk_user_id_idx").on(table.clerkUserId),
    index("users_email_idx").on(table.email)
  ]
);

export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id", {length: 128})
    .primaryKey()
    .references(() => users.clerkUserId, {onDelete: "cascade"}),
  dailyGoal: integer("daily_goal").notNull().default(12),
  englishLevel: englishLevelEnum("english_level").notNull().default("beginner"),
  learningDirection: learningDirectionEnum("learning_direction")
    .notNull()
    .default("english_to_ukrainian"),
  pronunciationPreference: pronunciationPreferenceEnum("pronunciation_preference")
    .notNull()
    .default("ukrainian"),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  theme: themePreferenceEnum("theme").notNull().default("system"),
  aiEnabled: boolean("ai_enabled").notNull().default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {withTimezone: true}),
  createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
});

export const decks = pgTable(
  "decks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    name: varchar("name", {length: 120}).notNull(),
    description: text("description"),
    color: varchar("color", {length: 24}).notNull().default("emerald"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("decks_owner_id_id_unique").on(table.ownerId, table.id),
    uniqueIndex("decks_owner_id_name_unique").on(table.ownerId, table.name),
    index("decks_owner_id_idx").on(table.ownerId),
    index("decks_owner_id_position_idx").on(table.ownerId, table.position)
  ]
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    deckId: uuid("deck_id").notNull(),
    english: varchar("english", {length: 180}).notNull(),
    ukrainianTranslation: text("ukrainian_translation").notNull(),
    ukrainianPronunciation: varchar("ukrainian_pronunciation", {length: 180}).notNull(),
    ipa: varchar("ipa", {length: 180}),
    exampleEnglish: text("example_english"),
    exampleUkrainian: text("example_ukrainian"),
    notes: text("notes"),
    favorite: boolean("favorite").notNull().default(false),
    difficulty: integer("difficulty").notNull().default(1),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    foreignKey({
      name: "cards_owner_id_deck_id_decks_owner_id_id_fk",
      columns: [table.ownerId, table.deckId],
      foreignColumns: [decks.ownerId, decks.id]
    }).onDelete("cascade"),
    uniqueIndex("cards_owner_id_id_unique").on(table.ownerId, table.id),
    index("cards_owner_id_idx").on(table.ownerId),
    index("cards_owner_id_deck_id_idx").on(table.ownerId, table.deckId),
    index("cards_owner_id_english_idx").on(table.ownerId, table.english),
    index("cards_owner_id_favorite_idx").on(table.ownerId, table.favorite)
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    name: varchar("name", {length: 80}).notNull(),
    color: varchar("color", {length: 24}).notNull().default("cyan"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("tags_owner_id_id_unique").on(table.ownerId, table.id),
    uniqueIndex("tags_owner_id_name_unique").on(table.ownerId, table.name),
    index("tags_owner_id_idx").on(table.ownerId)
  ]
);

export const cardTags = pgTable(
  "card_tags",
  {
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    cardId: uuid("card_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    primaryKey({
      name: "card_tags_pk",
      columns: [table.cardId, table.tagId]
    }),
    foreignKey({
      name: "card_tags_owner_id_card_id_cards_owner_id_id_fk",
      columns: [table.ownerId, table.cardId],
      foreignColumns: [cards.ownerId, cards.id]
    }).onDelete("cascade"),
    foreignKey({
      name: "card_tags_owner_id_tag_id_tags_owner_id_id_fk",
      columns: [table.ownerId, table.tagId],
      foreignColumns: [tags.ownerId, tags.id]
    }).onDelete("cascade"),
    index("card_tags_owner_id_card_id_idx").on(table.ownerId, table.cardId),
    index("card_tags_owner_id_tag_id_idx").on(table.ownerId, table.tagId)
  ]
);

export const reviewState = pgTable(
  "review_state",
  {
    cardId: uuid("card_id").primaryKey(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    status: reviewStatusEnum("status").notNull().default("new"),
    nextReviewAt: timestamp("next_review_at", {withTimezone: true}).notNull().defaultNow(),
    interval: integer("interval").notNull().default(0),
    ease: integer("ease").notNull().default(250),
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    foreignKey({
      name: "review_state_owner_id_card_id_cards_owner_id_id_fk",
      columns: [table.ownerId, table.cardId],
      foreignColumns: [cards.ownerId, cards.id]
    }).onDelete("cascade"),
    index("review_state_owner_id_idx").on(table.ownerId),
    index("review_state_owner_id_status_idx").on(table.ownerId, table.status),
    index("review_state_owner_id_next_review_at_idx").on(table.ownerId, table.nextReviewAt)
  ]
);

export const reviewHistory = pgTable(
  "review_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    cardId: uuid("card_id").notNull(),
    rating: reviewRatingEnum("rating").notNull(),
    previousStatus: reviewStatusEnum("previous_status").notNull(),
    nextStatus: reviewStatusEnum("next_status").notNull(),
    previousInterval: integer("previous_interval").notNull(),
    nextInterval: integer("next_interval").notNull(),
    previousEase: integer("previous_ease").notNull(),
    nextEase: integer("next_ease").notNull(),
    reviewedAt: timestamp("reviewed_at", {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [
    foreignKey({
      name: "review_history_owner_id_card_id_cards_owner_id_id_fk",
      columns: [table.ownerId, table.cardId],
      foreignColumns: [cards.ownerId, cards.id]
    }).onDelete("cascade"),
    index("review_history_owner_id_card_id_idx").on(table.ownerId, table.cardId),
    index("review_history_owner_id_reviewed_at_idx").on(table.ownerId, table.reviewedAt)
  ]
);

export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: varchar("owner_id", {length: 128})
      .notNull()
      .references(() => users.clerkUserId, {onDelete: "cascade"}),
    startedAt: timestamp("started_at", {withTimezone: true}).notNull().defaultNow(),
    completedAt: timestamp("completed_at", {withTimezone: true}),
    newCards: integer("new_cards").notNull().default(0),
    reviewedCards: integer("reviewed_cards").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0)
  },
  (table) => [
    index("learning_sessions_owner_id_started_at_idx").on(table.ownerId, table.startedAt),
    index("learning_sessions_owner_id_completed_at_idx").on(table.ownerId, table.completedAt)
  ]
);

export const usersRelations = relations(users, ({one, many}) => ({
  settings: one(userSettings, {
    fields: [users.clerkUserId],
    references: [userSettings.userId]
  }),
  decks: many(decks),
  cards: many(cards),
  tags: many(tags),
  reviewHistory: many(reviewHistory),
  learningSessions: many(learningSessions)
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
  user: one(users, {fields: [userSettings.userId], references: [users.clerkUserId]})
}));

export const decksRelations = relations(decks, ({one, many}) => ({
  owner: one(users, {fields: [decks.ownerId], references: [users.clerkUserId]}),
  cards: many(cards)
}));

export const cardsRelations = relations(cards, ({one, many}) => ({
  owner: one(users, {fields: [cards.ownerId], references: [users.clerkUserId]}),
  deck: one(decks, {fields: [cards.deckId], references: [decks.id]}),
  reviewState: one(reviewState, {fields: [cards.id], references: [reviewState.cardId]}),
  cardTags: many(cardTags),
  reviewHistory: many(reviewHistory)
}));

export const tagsRelations = relations(tags, ({one, many}) => ({
  owner: one(users, {fields: [tags.ownerId], references: [users.clerkUserId]}),
  cardTags: many(cardTags)
}));

export const cardTagsRelations = relations(cardTags, ({one}) => ({
  card: one(cards, {fields: [cardTags.cardId], references: [cards.id]}),
  tag: one(tags, {fields: [cardTags.tagId], references: [tags.id]}),
  owner: one(users, {fields: [cardTags.ownerId], references: [users.clerkUserId]})
}));

export const reviewStateRelations = relations(reviewState, ({one}) => ({
  card: one(cards, {fields: [reviewState.cardId], references: [cards.id]}),
  owner: one(users, {fields: [reviewState.ownerId], references: [users.clerkUserId]})
}));

export const reviewHistoryRelations = relations(reviewHistory, ({one}) => ({
  card: one(cards, {fields: [reviewHistory.cardId], references: [cards.id]}),
  owner: one(users, {fields: [reviewHistory.ownerId], references: [users.clerkUserId]})
}));

export const learningSessionsRelations = relations(learningSessions, ({one}) => ({
  owner: one(users, {fields: [learningSessions.ownerId], references: [users.clerkUserId]})
}));
