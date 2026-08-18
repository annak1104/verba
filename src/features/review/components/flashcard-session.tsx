"use client";

import {useEffect, useMemo, useRef, useState, useTransition} from "react";
import {ArrowLeftRight, Check, Eye, Keyboard, RotateCcw, Volume2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {Progress} from "@/components/ui/progress";
import {EmptyState} from "@/components/ui/state-view";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
import {SpeechRateControl} from "@/features/pronunciation/components/speech-rate-control";
import {useSpeechRate} from "@/features/pronunciation/use-text-to-speech";
import {gradeCardAction} from "@/features/review/actions";
import {scheduleNextReview} from "@/features/review/services/scheduler";
import type {LearningDirection, ReviewRating, Word} from "@/features/vocabulary/types";

const ratings: Array<{rating: ReviewRating; label: string; shortcut: string}> = [
  {rating: "again", label: "Again", shortcut: "1"},
  {rating: "hard", label: "Hard", shortcut: "2"},
  {rating: "good", label: "Good", shortcut: "3"},
  {rating: "easy", label: "Easy", shortcut: "4"}
];

export function FlashcardSession({
  initialCards,
  learningDirection
}: Readonly<{initialCards: Word[]; learningDirection: LearningDirection}>) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedRating, setSelectedRating] = useState<ReviewRating | null>(null);
  const [pending, startTransition] = useTransition();
  const {rate, setRate} = useSpeechRate();
  const touchStart = useRef<{x: number; y: number} | null>(null);
  const current = cards[index] ?? null;
  const completed = initialCards.length - cards.length;
  const progress = initialCards.length === 0 ? 100 : Math.round((completed / initialCards.length) * 100);
  const side = useMemo(
    () => getCardSides(current, learningDirection),
    [current, learningDirection]
  );
  const preview = useMemo(() => {
    if (!current || !selectedRating) return null;
    return scheduleNextReview({
      rating: selectedRating,
      state: current.memoryState,
      easeFactor: current.easeFactor,
      intervalDays: current.intervalDays,
      repetitions: current.repetitions,
      difficulty: current.difficulty,
      reviewedAt: new Date()
    });
  }, [current, selectedRating]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!current) return;

      if (event.key === " " || event.key === "Enter" || event.key === "ArrowUp") {
        event.preventDefault();
        setRevealed(true);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        setRevealed((value) => !value);
      }

      const rating = ratings.find((item) => item.shortcut === event.key)?.rating;
      if (rating && revealed) {
        event.preventDefault();
        grade(rating);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!current) {
    return (
      <EmptyState
        icon={Check}
        title="Review complete"
        description="Nice. Your next review times were scheduled without AI."
      />
    );
  }

  function revealFromGesture(x: number, y: number) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const dx = x - start.x;
    const dy = y - start.y;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
      setRevealed(true);
    }
  }

  function grade(rating: ReviewRating) {
    if (!current || pending) return;

    setSelectedRating(rating);
    startTransition(async () => {
      await gradeCardAction(current.id, rating);
      setCards((items) => items.filter((item) => item.id !== current.id));
      setIndex((value) => Math.min(value, Math.max(cards.length - 2, 0)));
      setRevealed(false);
      setSelectedRating(null);
    });
  }

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-muted-foreground">
            {completed + 1} / {initialCards.length}
          </div>
          <Badge variant="outline">{current.memoryState}</Badge>
        </div>
        <Progress value={progress} />
        <SpeechRateControl rate={rate} onRateChange={setRate} />
      </GlassCard>

      <div
        className="block w-full cursor-pointer text-left"
        role="button"
        tabIndex={0}
        onClick={() => setRevealed((value) => !value)}
        onPointerDown={(event) => {
          touchStart.current = {x: event.clientX, y: event.clientY};
        }}
        onPointerUp={(event) => revealFromGesture(event.clientX, event.clientY)}
      >
        <GlassCard className="min-h-[24rem] p-6 sm:min-h-[28rem]">
          <div className="flex h-full min-h-[21rem] flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <Badge>{current.deckName}</Badge>
              <div className="flex items-center gap-2">
                <SpeakerButton
                  aria-label={`Speak ${current.term}`}
                  className="rounded-xl"
                  rate={rate}
                  text={current.term}
                />
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <ArrowLeftRight className="size-4" />
                  Tap or swipe
                </div>
              </div>
            </div>

            <div className="space-y-5 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-[24px] bg-primary/12 text-primary">
                {revealed ? <Eye className="size-7" /> : <Volume2 className="size-7" />}
              </div>
              <div>
                <h2 className="text-4xl font-bold leading-tight sm:text-6xl">{side.frontTitle}</h2>
                {side.frontSubtitle ? (
                  <p className="mt-3 text-lg font-semibold text-muted-foreground">
                    {side.frontSubtitle}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="min-h-32">
              {revealed ? (
                <div className="glass-control space-y-3 rounded-[26px] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-2xl font-bold">{side.backTitle}</div>
                    <SpeakerButton
                      aria-label={`Speak ${current.term}`}
                      className="shrink-0 rounded-xl"
                      rate={rate}
                      text={current.term}
                    />
                  </div>
                  {side.backSubtitle ? (
                    <p className="text-sm font-semibold text-muted-foreground">{side.backSubtitle}</p>
                  ) : null}
                  {current.ipa ? <p className="text-sm text-muted-foreground">IPA: {current.ipa}</p> : null}
                  {current.example ? <p className="text-sm leading-6">{current.example}</p> : null}
                  {current.exampleUkrainian ? (
                    <p className="text-sm leading-6 text-muted-foreground">{current.exampleUkrainian}</p>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-muted-foreground">
                  <Keyboard className="size-4" />
                  Space reveals. 1-4 grade after reveal.
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ratings.map((item) => (
          <Button
            key={item.rating}
            disabled={!revealed || pending}
            type="button"
            variant={selectedRating === item.rating ? "default" : "glass"}
            onClick={() => grade(item.rating)}
          >
            {item.label}
            <span className="text-xs opacity-70">{item.shortcut}</span>
          </Button>
        ))}
      </div>

      {preview ? (
        <GlassCard className="p-4 text-center text-sm text-muted-foreground">
          Next: {preview.memoryState}, {preview.intervalDays === 0 ? "same day" : `${preview.intervalDays}d`} · ease{" "}
          {preview.easeFactor} · difficulty {preview.difficulty.toFixed(1)}
        </GlassCard>
      ) : null}

      <Button className="w-full" type="button" variant="glass" onClick={() => setRevealed(false)}>
        <RotateCcw className="size-4" />
        Hide answer
      </Button>
    </div>
  );
}

function getCardSides(card: Word | null, direction: LearningDirection) {
  if (!card) {
    return {
      frontTitle: "",
      frontSubtitle: "",
      backTitle: "",
      backSubtitle: ""
    };
  }

  if (direction === "ukrainian_to_english") {
    return {
      frontTitle: card.meaning,
      frontSubtitle: card.pronunciation ?? "",
      backTitle: card.term,
      backSubtitle: card.ipa ?? ""
    };
  }

  return {
    frontTitle: card.term,
    frontSubtitle: card.pronunciation ?? card.ipa ?? "",
    backTitle: card.meaning,
    backSubtitle: card.pronunciation ?? ""
  };
}
