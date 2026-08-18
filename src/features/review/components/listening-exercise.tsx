"use client";

import {useState} from "react";
import {Ear, Eye, SkipForward} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
import {SpeechRateControl} from "@/features/pronunciation/components/speech-rate-control";
import {useSpeechRate} from "@/features/pronunciation/use-text-to-speech";
import type {Word} from "@/features/vocabulary/types";

export function ListeningExercise({cards}: Readonly<{cards: Word[]}>) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const {rate, setRate} = useSpeechRate();
  const currentIndex = cards.length > 0 ? Math.min(index, cards.length - 1) : 0;
  const current = cards[currentIndex] ?? null;

  if (!current) return null;

  function nextCard() {
    setIndex((value) => (value + 1) % cards.length);
    setRevealed(false);
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
          {currentIndex + 1} / {cards.length}
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

        <div className="mt-5 min-h-28">
          {revealed ? (
            <div className="space-y-2">
              <h3 className="text-3xl font-bold leading-tight">{current.term}</h3>
              <p className="text-base font-semibold text-muted-foreground">{current.meaning}</p>
              {current.pronunciation ? (
                <p className="text-sm text-muted-foreground">{current.pronunciation}</p>
              ) : null}
              {current.ipa ? <p className="text-sm text-muted-foreground">IPA: {current.ipa}</p> : null}
            </div>
          ) : (
            <div className="flex min-h-28 items-center justify-center rounded-[24px] border border-dashed border-border/70 text-sm font-bold text-muted-foreground">
              Hidden word
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="glass" onClick={() => setRevealed(true)}>
          <Eye className="size-4" />
          Reveal
        </Button>
        <Button type="button" variant="glass" onClick={nextCard}>
          <SkipForward className="size-4" />
          Next
        </Button>
      </div>
    </GlassCard>
  );
}
