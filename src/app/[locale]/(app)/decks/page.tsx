import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {DecksManager} from "@/features/vocabulary/components/decks-manager";
import {getDecks} from "@/features/vocabulary/services/vocabulary-service";

export default async function DecksPage() {
  const t = await getTranslations("Decks");
  const decks = await getDecks();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DecksManager decks={decks} />
    </div>
  );
}
