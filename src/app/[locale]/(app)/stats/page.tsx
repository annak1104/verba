import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {ProgressOverview} from "@/features/progress/components/progress-overview";
import {getProgressStats} from "@/features/progress/services/progress-service";

export default async function StatsPage() {
  const t = await getTranslations("Stats");
  const stats = await getProgressStats();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ProgressOverview stats={stats} />
    </div>
  );
}
