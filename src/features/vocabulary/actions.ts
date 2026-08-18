"use server";

import {revalidatePath} from "next/cache";
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

export async function createCardAction(values: unknown): Promise<VocabularyActionState> {
  const parsed = cardFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: "Please check the word fields."};
  }

  await createCard(toCardInput(parsed.data));
  revalidateVocabulary();
  return {ok: true, message: "Word created."};
}

export async function updateCardAction(
  cardId: string,
  values: unknown
): Promise<VocabularyActionState> {
  const parsed = cardFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: "Please check the word fields."};
  }

  await updateCard({id: cardId, ...toCardInput(parsed.data)});
  revalidateVocabulary();
  return {ok: true, message: "Word updated."};
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
  const parsed = deckFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: "Please check the deck fields."};
  }

  await createDeck(toDeckInput(parsed.data));
  revalidateVocabulary();
  return {ok: true, message: "Deck created."};
}

export async function updateDeckAction(
  deckId: string,
  values: unknown
): Promise<VocabularyActionState> {
  const parsed = deckFormSchema.safeParse(values);
  if (!parsed.success) {
    return {ok: false, message: "Please check the deck fields."};
  }

  await updateDeck({id: deckId, ...toDeckInput(parsed.data)});
  revalidateVocabulary();
  return {ok: true, message: "Deck updated."};
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
