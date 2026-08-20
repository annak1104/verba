import {GlassCard} from "@/components/ui/glass-card";
import {WordForm} from "@/features/vocabulary/components/word-form";
import {createCardAction, generateWordCardAction} from "@/features/vocabulary/actions";
import type {Deck} from "@/features/vocabulary/types";
import {getTranslations} from "next-intl/server";
import {isUserAIAssistanceAvailable} from "@/features/settings/services/settings-service";

export async function LearnWordForm({decks}: Readonly<{decks: Deck[]}>) {
  const t = await getTranslations("WordForm");
  const aiAvailable = await isUserAIAssistanceAvailable();

  return (
    <GlassCard className="p-5">
      <WordForm
        aiAvailable={aiAvailable}
        decks={decks}
        submitLabel={t("saveSubmit")}
        onGenerateWordCard={generateWordCardAction}
        onSubmit={createCardAction}
      />
    </GlassCard>
  );
}
