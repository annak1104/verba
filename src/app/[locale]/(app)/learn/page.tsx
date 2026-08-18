import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {LearnWordForm} from "@/features/vocabulary/components/learn-word-form";
import {getDecks} from "@/features/vocabulary/services/vocabulary-service";

export default async function LearnPage() {
  const t = await getTranslations("Learn");
  const decks = await getDecks();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <LearnWordForm decks={decks} />
    </div>
  );
}
