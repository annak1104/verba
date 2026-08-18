import {getDueWords, getWords} from "@/features/vocabulary/services/vocabulary-service";
import type {StudyQueueItem} from "@/features/vocabulary/types";

export async function getDashboardSummary() {
  const [words, dueWords] = await Promise.all([getWords(), getDueWords()]);
  const queue: StudyQueueItem[] = dueWords.slice(0, 5).map((word) => ({
    id: word.id,
    term: word.term,
    meaning: word.meaning,
    deckName: word.deckName,
    memoryState: word.memoryState,
    kind: word.memoryState === "new" ? "new" : "review"
  }));

  return {
    newWords: words.filter((word) => word.memoryState === "new").length,
    dueReviews: dueWords.filter((word) => word.memoryState !== "new").length,
    streakDays: 6,
    queue
  };
}

export async function getProgressStats() {
  const words = await getWords();
  const learned = words.filter((word) => word.memoryState !== "new").length;
  const mastered = words.filter((word) => word.memoryState === "mastered").length;
  const retention = words.length === 0 ? 0 : Math.round((mastered / words.length) * 100);

  return {
    learned,
    reviews: words.reduce((sum, word) => sum + word.repetitions, 0),
    retention,
    total: words.length
  };
}
