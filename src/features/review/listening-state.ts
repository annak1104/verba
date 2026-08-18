import type {Word} from "@/features/vocabulary/types";

export type ListeningState = {
  cards: Word[];
  currentIndex: number;
  revealed: boolean;
};

export function createListeningState(cards: Word[]): ListeningState {
  return {cards: [...cards], currentIndex: 0, revealed: false};
}

export function getListeningCard(state: ListeningState) {
  return state.cards[state.currentIndex] ?? null;
}

export function revealListeningAnswer(state: ListeningState): ListeningState {
  return {...state, revealed: true};
}

export function goToNextListeningCard(state: ListeningState): ListeningState {
  if (state.cards.length === 0) return state;

  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % state.cards.length,
    revealed: false
  };
}

export function goToPreviousListeningCard(state: ListeningState): ListeningState {
  if (state.cards.length === 0) return state;

  return {
    ...state,
    currentIndex: (state.currentIndex - 1 + state.cards.length) % state.cards.length,
    revealed: false
  };
}

export function getListeningProgress(state: ListeningState) {
  const total = state.cards.length;
  return {
    current: total === 0 ? 0 : state.currentIndex + 1,
    total
  };
}
