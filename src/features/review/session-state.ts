import type {ReviewRating, Word} from "@/features/vocabulary/types";

export type SessionGrade = {
  cardId: string;
  rating: ReviewRating;
  wasCorrect: boolean;
  memoryState: Word["memoryState"];
};

export type ReviewSessionState = {
  cards: Word[];
  currentIndex: number;
  revealed: boolean;
  processedIds: string[];
  grades: SessionGrade[];
  completed: boolean;
};

export type SwipeIntent = "next" | "previous" | "tap" | "ignore";

const SWIPE_THRESHOLD = 48;
const VERTICAL_SCROLL_TOLERANCE = 1.25;

export function createReviewSession(cards: Word[]): ReviewSessionState {
  return {
    cards: [...cards],
    currentIndex: 0,
    revealed: false,
    processedIds: [],
    grades: [],
    completed: cards.length === 0
  };
}

export function getCurrentCard(state: ReviewSessionState) {
  if (state.completed) return null;
  return state.cards[state.currentIndex] ?? null;
}

export function revealCard(state: ReviewSessionState): ReviewSessionState {
  if (state.completed) return state;
  return {...state, revealed: true};
}

export function hideAnswer(state: ReviewSessionState): ReviewSessionState {
  if (state.completed) return state;
  return {...state, revealed: false};
}

export function goToNextCard(state: ReviewSessionState): ReviewSessionState {
  if (state.completed || state.cards.length === 0) return state;

  const nextIndex = findNextUnprocessedIndex(state, 1);
  if (nextIndex == null) return state;

  return {...state, currentIndex: nextIndex, revealed: false};
}

export function goToPreviousCard(state: ReviewSessionState): ReviewSessionState {
  if (state.completed || state.cards.length === 0) return state;

  const previousIndex = findNextUnprocessedIndex(state, -1);
  if (previousIndex == null) return state;

  return {...state, currentIndex: previousIndex, revealed: false};
}

export function gradeCurrentCard(
  state: ReviewSessionState,
  rating: ReviewRating
): ReviewSessionState {
  const current = getCurrentCard(state);
  if (!current || !state.revealed || state.processedIds.includes(current.id)) {
    return state;
  }

  const processedIds = [...state.processedIds, current.id];
  const completed = processedIds.length >= state.cards.length;
  const grades = [
    ...state.grades,
    {
      cardId: current.id,
      rating,
      wasCorrect: rating !== "again",
      memoryState: current.memoryState
    }
  ];

  if (completed) {
    return {
      ...state,
      processedIds,
      grades,
      revealed: false,
      completed: true
    };
  }

  return {
    ...state,
    currentIndex: findNextUnprocessedIndex({...state, processedIds}, 1) ?? state.currentIndex,
    revealed: false,
    processedIds,
    grades
  };
}

export function getSessionProgress(state: ReviewSessionState) {
  const total = state.cards.length;
  const processed = state.processedIds.length;

  return {
    total,
    processed,
    current: state.completed || total === 0 ? total : processed + 1,
    percent: total === 0 ? 100 : Math.round((processed / total) * 100)
  };
}

export function getSessionSummary(state: ReviewSessionState) {
  const correct = state.grades.filter((grade) => grade.wasCorrect).length;
  const again = state.grades.filter((grade) => grade.rating === "again").length;
  const newCards = state.grades.filter((grade) => grade.memoryState === "new").length;

  return {
    total: state.cards.length,
    reviewed: state.grades.length - newCards,
    newCards,
    correct,
    incorrect: state.grades.length - correct,
    again,
    accuracy: state.grades.length === 0 ? 0 : Math.round((correct / state.grades.length) * 100)
  };
}

export function getSwipeIntent(deltaX: number, deltaY: number): SwipeIntent {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < 8 && absY < 8) return "tap";
  if (absX < SWIPE_THRESHOLD || absX <= absY * VERTICAL_SCROLL_TOLERANCE) return "ignore";
  return deltaX < 0 ? "next" : "previous";
}

function findNextUnprocessedIndex(state: ReviewSessionState, direction: 1 | -1) {
  const processed = new Set(state.processedIds);
  const total = state.cards.length;

  for (let step = 1; step < total; step += 1) {
    const index = (state.currentIndex + step * direction + total) % total;
    const card = state.cards[index];
    if (card && !processed.has(card.id)) {
      return index;
    }
  }

  return null;
}
