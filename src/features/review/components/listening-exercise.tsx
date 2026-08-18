"use client";

import {useEffect, useState} from "react";
import {ArrowLeft, ArrowRight, Ear, Eye} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
import {SpeechRateControl} from "@/features/pronunciation/components/speech-rate-control";
import {
  useSpeechRate,
  useTextToSpeech
} from "@/features/pronunciation/use-text-to-speech";
import {getReviewCardContent} from "@/features/review/card-content";
import {
  createListeningState,
  getListeningCard,
  getListeningProgress,
  goToNextListeningCard,
  goToPreviousListeningCard,
  revealListeningAnswer
} from "@/features/review/listening-state";
import type {Word} from "@/features/vocabulary/types";

export function ListeningExercise({cards}: Readonly<{cards: Word[]}>) {
  const [state, setState] = useState(() => createListeningState(cards));
  const {rate, setRate} = useSpeechRate();
  const {stop} = useTextToSpeech();
  const current = getListeningCard(state);
  const progress = getListeningProgress(state);
  const content = getReviewCardContent(current, "ukrainian_to_english");

  useEffect(() => {
    stop();
    return stop;
  }, [current?.id, stop]);

  if (!current) return null;

  function nextCard() {
    setState((value) => goToNextListeningCard(value));
  }

  function previousCard() {
    setState((value) => goToPreviousListeningCard(value));
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-[18px] bg-primary/12 text-primary">
            <Ear className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Listening practice</h2>
            <p className="text-sm font-semibold text-muted-foreground">{current.deckName}</p>
          </div>
        </div>
        <Badge variant="outline">
          {progress.current} / {progress.total}
        </Badge>
      </div>

      <SpeechRateControl rate={rate} onRateChange={setRate} />

      <div className="glass-control rounded-[28px] p-5 text-center">
        <SpeakerButton
          className="mx-auto h-14 rounded-[22px] px-6"
          rate={rate}
          showLabel
          size="default"
          text={current.term}
        />

        <div className="mt-5 min-h-44">
          {state.revealed ? (
            <div className="space-y-3 text-left">
              <div className="text-center">
                <h3 className="text-3xl font-bold leading-tight">{content.english}</h3>
                <p className="mt-1 text-base font-semibold text-muted-foreground">{content.ukrainian}</p>
              </div>
              <AnswerLine label="Ukrainian pronunciation" value={content.ukrainianPronunciation} />
              <AnswerLine label="IPA" value={content.ipa} />
              <AnswerLine label="English example" value={content.exampleEnglish} />
              <AnswerLine label="Ukrainian example" value={content.exampleUkrainian} muted />
            </div>
          ) : (
            <div className="flex min-h-44 items-center justify-center rounded-[24px] border border-dashed border-border/70 text-sm font-bold text-muted-foreground">
              Hidden word
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] gap-2">
        <Button aria-label="Previous listening card" size="icon" type="button" variant="glass" onClick={previousCard}>
          <ArrowLeft className="size-4" />
        </Button>
        <Button type="button" variant="glass" onClick={() => setState((value) => revealListeningAnswer(value))}>
          <Eye className="size-4" />
          Reveal
        </Button>
        <Button aria-label="Next listening card" size="icon" type="button" variant="glass" onClick={nextCard}>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </GlassCard>
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
