"use server";

import {revalidatePath} from "next/cache";
import {getTranslations} from "next-intl/server";
import {z} from "zod";
import {
  aiVocabularySuggestionSchema,
  suggestVocabulary,
  type AiVocabularySuggestion,
  type VocabularyEnrichmentField
} from "@/features/ai/vocabulary";
import {isUserAIAssistanceAvailable} from "@/features/settings/services/settings-service";
import {
  createCard,
  createDeck,
  deleteCard,
  deleteDeck,
  moveDeck,
  toggleFavorite,
  updateCard,
  updateDeck
} from "@/features/vocabulary/services/vocabulary-service";
import {cardFormSchema, deckFormSchema} from "@/features/vocabulary/schemas";
import type {CreateCardInput, CreateDeckInput} from "@/features/vocabulary/types";

const vocabularyPaths = ["/learn", "/words", "/decks", "/review", "/today", "/stats"];

export type VocabularyActionState = {
  ok: boolean;
  message: string;
};

export type GenerateWordCardState =
  | {
      ok: true;
      values: AiVocabularySuggestion;
    }
  | {
      ok: false;
      message: string;
    };

const aiGeneratedFieldNames = [
  "ukrainianTranslation",
  "ukrainianPronunciation",
  "ipa",
  "exampleEnglish",
  "exampleUkrainian"
] as const;

const aiGeneratedFieldSchema = z.enum(aiGeneratedFieldNames);

const generateWordCardSchema = z.object({
  english: cardFormSchema.shape.english,
  locale: z.enum(["en", "uk"]),
  context: aiVocabularySuggestionSchema.partial().optional(),
  requestedFields: z.array(aiGeneratedFieldSchema).min(1).max(5).optional()
});

export async function generateWordCardAction(values: unknown): Promise<GenerateWordCardState> {
  const t = await getTranslations("WordForm");
  const aiAvailable = await isUserAIAssistanceAvailable();
  if (!aiAvailable) {
    return {ok: false, message: t("aiDisabled")};
  }

  const parsed = generateWordCardSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: t("aiWordRequired")};
  }

  const requestedFields = parsed.data.requestedFields as
    | VocabularyEnrichmentField[]
    | undefined;
  const context = cleanVocabularyContext(parsed.data.context);
  if (requestedFields) {
    context.requestedFields = requestedFields;
  }

  const suggestion = await suggestVocabulary(parsed.data.english, parsed.data.locale, context);
  if (!suggestion) {
    return {ok: false, message: t("aiUnavailable")};
  }

  return {ok: true, values: suggestion};
}

function cleanVocabularyContext(
  context: Partial<Record<VocabularyEnrichmentField, string | undefined>> | undefined
) {
  const cleanContext: Partial<AiVocabularySuggestion> & {
    requestedFields?: VocabularyEnrichmentField[];
  } = {};

  for (const field of aiGeneratedFieldNames) {
    const value = context?.[field]?.trim();
    if (value) {
      cleanContext[field] = value;
    }
  }

  return cleanContext;
}

export async function createCardAction(values: unknown): Promise<VocabularyActionState> {
  const t = await getTranslations("Actions");
  const parsed = cardFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: t("wordInvalid")};
  }

  await createCard(toCardInput(parsed.data));
  revalidateVocabulary();
  return {ok: true, message: t("wordCreated")};
}

export async function updateCardAction(
  cardId: string,
  values: unknown
): Promise<VocabularyActionState> {
  const t = await getTranslations("Actions");
  const parsed = cardFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: t("wordInvalid")};
  }

  await updateCard({id: cardId, ...toCardInput(parsed.data)});
  revalidateVocabulary();
  return {ok: true, message: t("wordUpdated")};
}

export async function deleteCardAction(cardId: string) {
  await deleteCard(cardId);
  revalidateVocabulary();
}

export async function toggleFavoriteAction(cardId: string) {
  await toggleFavorite(cardId);
  revalidateVocabulary();
}

export async function createDeckAction(values: unknown): Promise<VocabularyActionState> {
  const t = await getTranslations("Actions");
  const parsed = deckFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: t("deckInvalid")};
  }

  await createDeck(toDeckInput(parsed.data));
  revalidateVocabulary();
  return {ok: true, message: t("deckCreated")};
}

export async function updateDeckAction(
  deckId: string,
  values: unknown
): Promise<VocabularyActionState> {
  const t = await getTranslations("Actions");
  const parsed = deckFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: t("deckInvalid")};
  }

  await updateDeck({id: deckId, ...toDeckInput(parsed.data)});
  revalidateVocabulary();
  return {ok: true, message: t("deckUpdated")};
}

export async function deleteDeckAction(deckId: string) {
  await deleteDeck(deckId);
  revalidateVocabulary();
}

export async function moveDeckAction(deckId: string, direction: "up" | "down") {
  await moveDeck(deckId, direction);
  revalidateVocabulary();
}

function revalidateVocabulary() {
  for (const path of vocabularyPaths) {
    revalidatePath(path);
  }
}

function toCardInput(values: typeof cardFormSchema._output): CreateCardInput {
  return {
    deckId: values.deckId,
    english: values.english,
    ukrainianTranslation: values.ukrainianTranslation,
    ukrainianPronunciation: values.ukrainianPronunciation,
    ...(values.ipa ? {ipa: values.ipa} : {}),
    ...(values.exampleEnglish ? {exampleEnglish: values.exampleEnglish} : {}),
    ...(values.exampleUkrainian ? {exampleUkrainian: values.exampleUkrainian} : {}),
    ...(values.notes ? {notes: values.notes} : {}),
    favorite: values.favorite,
    difficulty: values.difficulty,
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };
}

function toDeckInput(values: typeof deckFormSchema._output): CreateDeckInput {
  return {
    name: values.name,
    ...(values.description ? {description: values.description} : {}),
    color: values.color
  };
}
