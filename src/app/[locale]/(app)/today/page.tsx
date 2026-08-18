import {getTranslations} from "next-intl/server";
import {BookOpenCheck, CalendarCheck, Flame, Play} from "lucide-react";
import {PageHeader} from "@/components/layout/page-header";
import {Button} from "@/components/ui/button";
import {MetricCard} from "@/features/progress/components/metric-card";
import {SessionQueue} from "@/features/study/components/session-queue";
import {getDashboardSummary} from "@/features/progress/services/progress-service";

export default async function TodayPage() {
  const t = await getTranslations("Today");
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard icon={BookOpenCheck} label={t("newWords")} value={summary.newWords} />
        <MetricCard icon={CalendarCheck} label={t("dueReviews")} value={summary.dueReviews} />
        <MetricCard icon={Flame} label={t("streak")} value={summary.streakDays} />
      </div>
      <Button className="h-12 w-full text-base">
        <Play className="size-4" />
        {t("start")}
      </Button>
      <SessionQueue items={summary.queue} />
    </div>
  );
}
