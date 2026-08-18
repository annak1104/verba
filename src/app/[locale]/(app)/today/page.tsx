import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {TodayDashboard} from "@/features/progress/components/today-dashboard";
import {getDashboardSummary} from "@/features/progress/services/progress-service";

export default async function TodayPage() {
  const t = await getTranslations("Today");
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TodayDashboard summary={summary} />
    </div>
  );
}
