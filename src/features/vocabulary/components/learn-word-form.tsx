import {GlassCard} from "@/components/ui/glass-card";
import {WordForm} from "@/features/vocabulary/components/word-form";
import {createCardAction} from "@/features/vocabulary/actions";
import type {Deck} from "@/features/vocabulary/types";
import {getTranslations} from "next-intl/server";

export async function LearnWordForm({decks}: Readonly<{decks: Deck[]}>) {
  const t = await getTranslations("WordForm");

  return (
    <GlassCard className="p-5">
      <WordForm decks={decks} submitLabel={t("saveSubmit")} onSubmit={createCardAction} />
    </GlassCard>
  );
}
