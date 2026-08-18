import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {ReviewWorkspace} from "@/features/review/components/review-workspace";
import {getUserSettings} from "@/features/settings/services/settings-service";
import {getDueWords} from "@/features/vocabulary/services/vocabulary-service";

export default async function ReviewPage() {
  const t = await getTranslations("Review");
  const [cards, settings] = await Promise.all([getDueWords(), getUserSettings()]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReviewWorkspace cards={cards} learningDirection={settings.learningDirection} />
    </div>
  );
}
