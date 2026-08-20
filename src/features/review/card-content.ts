import type {LearningDirection, Word} from "@/features/vocabulary/types";

export type ReviewCardContent = {
  frontTitle: string;
  frontSubtitle: string;
  expectedAnswer: string;
  secondaryAnswer: string;
  english: string;
  ukrainian: string;
  ukrainianPronunciation: string;
  ipa: string;
  exampleEnglish: string;
  exampleUkrainian: string;
};

export function getReviewCardContent(
  card: Word | null,
  direction: LearningDirection
): ReviewCardContent {
  if (!card) {
    return {
      frontTitle: "",
      frontSubtitle: "",
      expectedAnswer: "",
      secondaryAnswer: "",
      english: "",
      ukrainian: "",
      ukrainianPronunciation: "",
      ipa: "",
      exampleEnglish: "",
      exampleUkrainian: ""
    };
  }

  const englishToUkrainian = direction !== "ukrainian_to_english";

  return {
    frontTitle: englishToUkrainian ? card.term : card.meaning,
    frontSubtitle: englishToUkrainian ? card.ipa ?? "" : card.pronunciation ?? "",
    expectedAnswer: englishToUkrainian ? card.meaning : card.term,
    secondaryAnswer: englishToUkrainian ? card.term : card.meaning,
    english: card.term,
    ukrainian: card.meaning,
    ukrainianPronunciation: card.pronunciation ?? "",
    ipa: card.ipa ?? "",
    exampleEnglish: shortenExample(card.example),
    exampleUkrainian: shortenExample(card.exampleUkrainian ?? "")
  };
}

export function normalizeReviewDirection(direction: LearningDirection): LearningDirection {
  return direction === "ukrainian_to_english" ? "ukrainian_to_english" : "english_to_ukrainian";
}

export function getVisibleSpeakerActionCount(
  card: Word | null,
  direction: LearningDirection,
  revealed: boolean
) {
  if (!card) return 0;
  if (revealed) return 1;

  const content = getReviewCardContent(card, direction);
  return content.frontTitle === card.term ? 1 : 0;
}

function shortenExample(value: string) {
  const trimmed = value.trim();
  if (trimmed.length <= 150) return trimmed;
  return `${trimmed.slice(0, 147).trim()}...`;
}
