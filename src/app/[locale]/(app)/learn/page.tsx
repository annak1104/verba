import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {ListeningExercise} from "@/features/review/components/listening-exercise";
import {LearnModes} from "@/features/study/components/learn-modes";
import {LearnWordForm} from "@/features/vocabulary/components/learn-word-form";
import {ensureDefaultDeck, getDecks, getDueWords} from "@/features/vocabulary/services/vocabulary-service";

export default async function LearnPage({
  searchParams
}: Readonly<{searchParams?: Promise<{mode?: string}>}>) {
  const t = await getTranslations("Learn");
  const params = await searchParams;
  const mode = params?.mode === "listening" ? "listening" : "add";
  const [decks, cards] = await Promise.all([getDecks(), mode === "listening" ? getDueWords() : Promise.resolve([])]);
  const availableDecks = decks.length > 0 ? decks : [await ensureDefaultDeck()];

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <LearnModes active={mode} />
      {mode === "listening" ? <ListeningExercise cards={cards} /> : <LearnWordForm decks={availableDecks} />}
    </div>
  );
}
