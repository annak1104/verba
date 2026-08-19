import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {EmptyState} from "@/components/ui/state-view";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
import type {Word} from "@/features/vocabulary/types";
import {getTranslations} from "next-intl/server";

export async function WordList({words}: Readonly<{words: Word[]}>) {
  const t = await getTranslations("Words");
  const tPronunciation = await getTranslations("Pronunciation");

  if (words.length === 0) {
    return <EmptyState title={t("noWordsTitle")} description={t("noWordsDescription")} />;
  }

  return (
    <div className="space-y-3">
      {words.map((word) => (
        <GlassCard key={word.id} interactive className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-bold">{word.term}</h2>
                <SpeakerButton
                  className="size-9 rounded-xl"
                  label={tPronunciation("speakEnglish")}
                  text={word.term}
                />
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{word.meaning}</p>
            </div>
            <Badge>{word.deckName}</Badge>
          </div>
          <p className="glass-control rounded-[22px] p-4 text-sm leading-6">{word.example}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline">{t(`memory.${word.memoryState}`)}</Badge>
            <span>{t("dueOn", {date: word.dueOn})}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
