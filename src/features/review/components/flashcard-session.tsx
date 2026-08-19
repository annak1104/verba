"use client";

import {useEffect, useMemo, useRef, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {ArrowLeft, ArrowLeftRight, ArrowRight, Check} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {Progress} from "@/components/ui/progress";
import {EmptyState} from "@/components/ui/state-view";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
import {
  useSpeechRate,
  useTextToSpeech
} from "@/features/pronunciation/use-text-to-speech";
import {getReviewCardContent} from "@/features/review/card-content";
import {
  FLASHCARD_BACK_SCROLL_CLASS,
  FLASHCARD_CARD_CLASS,
  FLASHCARD_FACE_CLASS
} from "@/features/review/flashcard-layout";
import {
  completeReviewSessionAction,
  gradeCardAction,
  startReviewSessionAction
} from "@/features/review/actions";
import {
  createReviewSession,
  getCurrentCard,
  getSessionProgress,
  getSessionSummary,
  getSwipeIntent,
  goToNextCard,
  goToPreviousCard,
  gradeCurrentCard,
  hideAnswer,
  revealCard,
  type ReviewSessionState
} from "@/features/review/session-state";
import type {LearningDirection, ReviewRating, Word} from "@/features/vocabulary/types";
import {cn} from "@/lib/utils";

const ratings: Array<{rating: ReviewRating; labelKey: "again" | "hard" | "good" | "easy"; shortcut: string}> = [
  {rating: "again", labelKey: "again", shortcut: "1"},
  {rating: "hard", labelKey: "hard", shortcut: "2"},
  {rating: "good", labelKey: "good", shortcut: "3"},
  {rating: "easy", labelKey: "easy", shortcut: "4"}
];

type PointerStart = {
  x: number;
  y: number;
};

export function FlashcardSession({
  initialCards,
  learningDirection
}: Readonly<{initialCards: Word[]; learningDirection: LearningDirection}>) {
  const t = useTranslations("Review");
  const tPronunciation = useTranslations("Pronunciation");
  const [session, setSession] = useState<ReviewSessionState>(() => createReviewSession(initialCards));
  const [selectedRating, setSelectedRating] = useState<ReviewRating | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {rate} = useSpeechRate();
  const {stop} = useTextToSpeech();
  const pointerStart = useRef<PointerStart | null>(null);
  const submittingCardId = useRef<string | null>(null);
  const completedSessionId = useRef<string | null>(null);
  const current = getCurrentCard(session);
  const content = useMemo(
    () => getReviewCardContent(current, learningDirection),
    [current, learningDirection]
  );
  const progress = getSessionProgress(session);
  const summary = getSessionSummary(session);
  const frontHasEnglishAudio = current != null && content.frontTitle === current.term;

  useEffect(() => {
    if (initialCards.length === 0) return;

    let cancelled = false;
    void startReviewSessionAction().then((result) => {
      if (!cancelled) {
        setSessionId(result.sessionId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialCards.length]);

  useEffect(() => {
    stop();
    return stop;
  }, [current?.id, stop]);

  useEffect(() => {
    if (!session.completed || !sessionId || completedSessionId.current === sessionId) return;

    completedSessionId.current = sessionId;
    void completeReviewSessionAction({
      sessionId,
      newCards: summary.newCards,
      reviewedCards: summary.reviewed,
      correctCount: summary.correct,
      incorrectCount: summary.incorrect
    });
  }, [session.completed, sessionId, summary.correct, summary.incorrect, summary.newCards, summary.reviewed]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!current || pending || submittingCardId.current) return;

      if (event.key === " " || event.key === "Enter" || event.key === "ArrowUp") {
        event.preventDefault();
        setSession((value) => (value.revealed ? hideAnswer(value) : revealCard(value)));
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveNext();
        return;
      }

      const rating = ratings.find((item) => item.shortcut === event.key)?.rating;
      if (rating && session.revealed) {
        event.preventDefault();
        grade(rating);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (session.completed) {
    return (
      <GlassCard className="space-y-5 p-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-[24px] bg-primary/12 text-primary">
          <Check className="size-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("completeTitle")}</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {t("completeSummary", {
              correct: summary.correct,
              incorrect: summary.incorrect,
              accuracy: summary.accuracy
            })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm font-bold text-muted-foreground">
          <ResultStat label={t("cards")} value={summary.total} />
          <ResultStat label={t("newCards")} value={summary.newCards} />
          <ResultStat label={t("again")} value={summary.again} />
        </div>
      </GlassCard>
    );
  }

  if (!current) {
    return (
      <EmptyState
        icon={Check}
        title={t("noCardsTitle")}
        description={t("noCardsDescription")}
      />
    );
  }

  function moveNext() {
    if (pending || submittingCardId.current) return;
    setSession((value) => goToNextCard(value));
  }

  function movePrevious() {
    if (pending || submittingCardId.current) return;
    setSession((value) => goToPreviousCard(value));
  }

  function handlePointerEnd(x: number, y: number) {
    if (pending || submittingCardId.current) {
      pointerStart.current = null;
      return;
    }

    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const intent = getSwipeIntent(x - start.x, y - start.y);

    if (intent === "next") {
      moveNext();
      return;
    }

    if (intent === "previous") {
      movePrevious();
      return;
    }

    if (intent === "tap") {
      setSession((value) => (value.revealed ? hideAnswer(value) : revealCard(value)));
    }
  }

  function grade(rating: ReviewRating) {
    if (!current || !session.revealed || pending || submittingCardId.current) return;

    submittingCardId.current = current.id;
    setSelectedRating(rating);
    startTransition(async () => {
      try {
        await gradeCardAction(current.id, rating);
        setSession((value) => gradeCurrentCard(value, rating));
      } finally {
        submittingCardId.current = null;
        setSelectedRating(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between gap-3 text-sm font-bold text-muted-foreground">
          <span>
            {progress.current} / {progress.total}
          </span>
          <span>{progress.percent}%</span>
        </div>
        <Progress value={progress.percent} />
      </div>

      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
        <Button
          aria-label={t("previousCard")}
          className="rounded-full"
          disabled={pending || submittingCardId.current != null}
          size="icon"
          type="button"
          variant="glass"
          onClick={movePrevious}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div
          aria-label={t("flashcard")}
          className="touch-pan-y select-none [perspective:1200px]"
          role="button"
          tabIndex={0}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          onPointerDown={(event) => {
            if (pending || submittingCardId.current) return;
            pointerStart.current = {x: event.clientX, y: event.clientY};
          }}
          onPointerUp={(event) => handlePointerEnd(event.clientX, event.clientY)}
        >
          <GlassCard className={cn(FLASHCARD_CARD_CLASS, "relative")}>
            <div
              className="relative size-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
              style={{transform: session.revealed ? "rotateY(180deg)" : "rotateY(0deg)"}}
            >
              <div aria-hidden={session.revealed} className={cn(FLASHCARD_FACE_CLASS, "justify-between")}>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">{current.memoryState}</Badge>
                  {!session.revealed && frontHasEnglishAudio ? (
                    <SpeakerButton
                      className="rounded-xl"
                      label={tPronunciation("speakEnglish")}
                      rate={rate}
                      text={current.term}
                    />
                  ) : (
                    <div className="size-11" aria-hidden />
                  )}
                </div>

                <div className="space-y-4 text-center">
                  <h2 className="text-4xl font-bold leading-tight sm:text-6xl">{content.frontTitle}</h2>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                  <ArrowLeftRight className="size-4" />
                  {t("tapHint")}
                </div>
              </div>

              <div
                aria-hidden={!session.revealed}
                className={cn(
                  FLASHCARD_FACE_CLASS,
                  "gap-4 [transform:rotateY(180deg)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
                      {t("correctAnswer")}
                    </div>
                    <h2 className="mt-1 line-clamp-2 text-3xl font-bold leading-tight">
                      {content.expectedAnswer}
                    </h2>
                  </div>
                  {session.revealed ? (
                    <SpeakerButton
                      className="shrink-0 rounded-xl"
                      label={tPronunciation("speakEnglish")}
                      rate={rate}
                      text={current.term}
                    />
                  ) : (
                    <div className="size-11 shrink-0" aria-hidden />
                  )}
                </div>

                <div className={cn(FLASHCARD_BACK_SCROLL_CLASS, "space-y-3")}>
                  <AnswerLine label={t("english")} value={content.english} />
                  <AnswerLine label={t("ukrainian")} value={content.ukrainian} />
                  <AnswerLine label={t("ukrainianPronunciation")} value={content.ukrainianPronunciation} />
                  <AnswerLine label={t("ipa")} value={content.ipa} />
                  <AnswerLine label={t("englishExample")} value={content.exampleEnglish} />
                  <AnswerLine label={t("ukrainianExample")} value={content.exampleUkrainian} muted />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <Button
          aria-label={t("nextCard")}
          className="rounded-full"
          disabled={pending || submittingCardId.current != null}
          size="icon"
          type="button"
          variant="glass"
          onClick={moveNext}
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", !session.revealed && "invisible")}>
        {ratings.map((item) => (
          <Button
            key={item.rating}
            disabled={!session.revealed || pending || submittingCardId.current != null}
            type="button"
            variant={selectedRating === item.rating ? "default" : "glass"}
            onClick={() => grade(item.rating)}
          >
            {t(item.labelKey)}
            <span className="text-xs opacity-70">{item.shortcut}</span>
          </Button>
        ))}
      </div>

    </div>
  );
}

function AnswerLine({
  label,
  value,
  muted = false
}: Readonly<{label: string; value: string; muted?: boolean}>) {
  if (!value) return null;

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</div>
      <p className={muted ? "mt-1 text-sm leading-6 text-muted-foreground" : "mt-1 text-sm leading-6"}>
        {value}
      </p>
    </div>
  );
}

function ResultStat({label, value}: Readonly<{label: string; value: number}>) {
  return (
    <div className="glass-control rounded-2xl p-3">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
