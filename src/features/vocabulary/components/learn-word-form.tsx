import {GlassCard} from "@/components/ui/glass-card";
import {WordForm} from "@/features/vocabulary/components/word-form";
import {createCardAction} from "@/features/vocabulary/actions";
import type {Deck} from "@/features/vocabulary/types";

export function LearnWordForm({decks}: Readonly<{decks: Deck[]}>) {
  return (
    <GlassCard className="p-5">
      <WordForm decks={decks} submitLabel="Save word" onSubmit={createCardAction} />
    </GlassCard>
  );
}
