import {getVocabularyRepository} from "@/features/vocabulary/repositories";
import {getTranslations} from "next-intl/server";
import enMessages from "../../../../messages/en.json";
import ukMessages from "../../../../messages/uk.json";
import type {
  CardFilters,
  CreateCardInput,
  CreateDeckInput,
  UpdateCardInput,
  UpdateDeckInput
} from "@/features/vocabulary/types";

export async function getDecks() {
  const {repository, userId} = await getVocabularyRepository();
  return repository.listDecks(userId);
}

export async function ensureDefaultDeck() {
  const {repository, userId} = await getVocabularyRepository();
  return repository.ensureDefaultDeck(userId, await getLocalizedDefaultDeckInput());
}

export async function ensureDefaultDeckForUser(userId: string) {
  const {DrizzleVocabularyRepository} = await import(
    "@/features/vocabulary/repositories/vocabulary-repository"
  );

  return new DrizzleVocabularyRepository().ensureDefaultDeck(userId, await getLocalizedDefaultDeckInput());
}

export async function getDeckOptions() {
  const decks = await getDecks();
  return decks.map((deck) => ({label: deck.name, value: deck.id}));
}

export async function getWords(filters?: CardFilters) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.listWords(userId, filters);
}

export async function getDueWords() {
  const {repository, userId} = await getVocabularyRepository();
  return repository.listDueWords(userId, new Date().toISOString().slice(0, 10));
}

export async function createDeck(input: CreateDeckInput) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.createDeck(userId, input);
}

export async function updateDeck(input: UpdateDeckInput) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.updateDeck(userId, input);
}

export async function deleteDeck(deckId: string) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.deleteDeck(userId, deckId);
}

export async function moveDeck(deckId: string, direction: "up" | "down") {
  const {repository, userId} = await getVocabularyRepository();
  return repository.moveDeck(userId, deckId, direction);
}

export async function createCard(input: CreateCardInput) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.createCard(userId, input);
}

export async function updateCard(input: UpdateCardInput) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.updateCard(userId, input);
}

export async function deleteCard(cardId: string) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.deleteCard(userId, cardId);
}

export async function toggleFavorite(cardId: string) {
  const {repository, userId} = await getVocabularyRepository();
  return repository.toggleFavorite(userId, cardId);
}

export async function getTags() {
  const {repository, userId} = await getVocabularyRepository();
  return repository.listTags(userId);
}

async function getLocalizedDefaultDeckInput() {
  const t = await getTranslations("DefaultDeck");

  return {
    name: t("name"),
    description: t("description"),
    color: "emerald" as const,
    fallbackNames: [enMessages.DefaultDeck.name, ukMessages.DefaultDeck.name]
  };
}
