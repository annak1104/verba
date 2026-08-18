"use client";

import {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {EmptyState} from "@/components/ui/state-view";
import {scheduleNextReview} from "@/features/review/services/scheduler";
import type {ReviewRating, Word} from "@/features/vocabulary/types";

const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];

export function ReviewCard({item}: Readonly<{item: Word | null}>) {
  const t = useTranslations("Review");
  const [rating, setRating] = useState<ReviewRating | null>(null);
  const schedule = useMemo(() => {
    if (!item || !rating) {
      return null;
    }

    return scheduleNextReview({
      rating,
      easeFactor: item.easeFactor,
      intervalDays: item.intervalDays,
      repetitions: item.repetitions,
      reviewedAt: new Date("2026-08-18T12:00:00.000Z")
    });
  }, [item, rating]);

  if (!item) {
    return <EmptyState title="No reviews due" description="You are clear for now." />;
  }

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-[22px] bg-primary/12 text-primary">
            <RotateCcw className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-3xl font-bold leading-tight">{item.term}</h2>
            <p className="text-sm text-muted-foreground">{item.deckName}</p>
          </div>
        </div>
        <Badge variant="outline">{item.memoryState}</Badge>
      </div>
      <div className="glass-control rounded-[26px] p-5">
        <div className="text-lg font-bold">{item.meaning}</div>
        <div className="mt-3 text-sm leading-6 text-muted-foreground">{item.example}</div>
      </div>
        <div className="grid grid-cols-2 gap-2">
          {ratings.map((nextRating) => (
            <Button
              key={nextRating}
              type="button"
              variant={rating === nextRating ? "default" : "glass"}
              onClick={() => setRating(nextRating)}
            >
              {t(nextRating)}
            </Button>
          ))}
        </div>
        {schedule ? (
        <p className="glass-control rounded-2xl p-3 text-center text-sm text-muted-foreground">
            Next due on {schedule.dueOn}, interval {schedule.intervalDays}d.
          </p>
        ) : null}
    </GlassCard>
  );
}
