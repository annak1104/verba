"use client";

import {useState} from "react";
import {DirectionToggle} from "@/features/review/components/direction-toggle";
import {FlashcardSession} from "@/features/review/components/flashcard-session";
import {normalizeReviewDirection} from "@/features/review/card-content";
import type {LearningDirection, Word} from "@/features/vocabulary/types";

export function ReviewWorkspace({
  cards,
  learningDirection
}: Readonly<{cards: Word[]; learningDirection: LearningDirection}>) {
  const [direction, setDirection] = useState<LearningDirection>(normalizeReviewDirection(learningDirection));

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-1">
        <DirectionToggle value={direction} onValueChange={setDirection} />
      </div>
      <FlashcardSession initialCards={cards} learningDirection={direction} />
    </div>
  );
}
