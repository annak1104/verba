import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {FlashcardSession} from "@/features/review/components/flashcard-session";
import {ListeningExercise} from "@/features/review/components/listening-exercise";
import {getUserSettings} from "@/features/settings/services/settings-service";
import {getDueWords} from "@/features/vocabulary/services/vocabulary-service";

export default async function ReviewPage() {
  const t = await getTranslations("Review");
  const [cards, settings] = await Promise.all([getDueWords(), getUserSettings()]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <FlashcardSession initialCards={cards} learningDirection={settings.learningDirection} />
      <ListeningExercise cards={cards} />
    </div>
  );
}
