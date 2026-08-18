import {BookOpen} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {GlassCard} from "@/components/ui/glass-card";
import type {Deck} from "@/features/vocabulary/types";
import {cn} from "@/lib/utils";

const colorClass: Record<Deck["color"], string> = {
  emerald: "bg-primary/12 text-primary",
  cyan: "bg-accent text-accent-foreground",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  rose: "bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100"
};

export async function DeckGrid({decks}: Readonly<{decks: Deck[]}>) {
  const t = await getTranslations("Decks");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <GlassCard key={deck.id} interactive className="space-y-5 p-5">
            <div className={cn("grid size-12 place-items-center rounded-[22px]", colorClass[deck.color])}>
              <BookOpen className="size-5" />
            </div>
            <div className="space-y-1">
            <h2 className="text-xl font-bold">{deck.name}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{deck.description}</p>
            </div>
          <div className="text-sm font-bold">{t("words", {count: deck.wordCount})}</div>
        </GlassCard>
      ))}
    </div>
  );
}
