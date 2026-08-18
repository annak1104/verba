import type {Route} from "next";
import Link from "next/link";
import {BookOpenCheck, CalendarCheck, Flame, Layers3, Medal, PenLine, Play} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {GlassCard} from "@/components/ui/glass-card";
import {Progress} from "@/components/ui/progress";
import {MetricCard} from "@/features/progress/components/metric-card";
import {SessionQueue} from "@/features/study/components/session-queue";
import type {DashboardSummary} from "@/features/progress/repositories/progress-repository";

const reviewRoute = "/review" as Route;
const learnRoute = "/learn" as Route;
const decksRoute = "/decks" as Route;

export async function TodayDashboard({summary}: Readonly<{summary: DashboardSummary}>) {
  const t = await getTranslations("Today");
  const continueRoute = summary.queue.length > 0 ? reviewRoute : learnRoute;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <MetricCard icon={Flame} label={t("streak")} value={summary.streakDays} />
        <MetricCard icon={CalendarCheck} label={t("dueReviews")} value={summary.dueReviews} />
        <MetricCard icon={BookOpenCheck} label={t("newWords")} value={summary.newWords} />
        <MetricCard icon={Medal} label={t("mastered")} value={summary.mastered} />
      </div>

      <GlassCard className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{t("dailyGoal")}</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {summary.dailyCompleted} / {summary.dailyGoal} {t("activities")}
            </p>
          </div>
          <Badge variant={summary.dailyProgress >= 100 ? "default" : "outline"}>
            {summary.dailyProgress}%
          </Badge>
        </div>
        <Progress value={summary.dailyProgress} />
        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="h-12">
            <Link href={continueRoute}>
              <Play className="size-4" />
              {t("continueLearning")}
            </Link>
          </Button>
          <Button asChild className="h-12" variant="glass">
            <Link href={learnRoute}>
              <PenLine className="size-4" />
              {t("addWord")}
            </Link>
          </Button>
        </div>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <SessionQueue items={summary.queue} />
        <GlassCard className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{t("todaysSummary")}</h2>
            <Badge variant="outline">{summary.todaySummary.totalActivity}</Badge>
          </div>
          <SummaryRow label={t("addedToday")} value={summary.todaySummary.newWords} />
          <SummaryRow label={t("reviewsToday")} value={summary.todaySummary.reviews} />
          <SummaryRow label={t("correctToday")} value={summary.todaySummary.correct} />
          <SummaryRow label={t("accuracyToday")} value={`${summary.todaySummary.accuracy}%`} />
        </GlassCard>
      </div>

      <GlassCard className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t("recentDecks")}</h2>
          <Button asChild size="sm" variant="glass">
            <Link href={decksRoute}>
              <Layers3 className="size-4" />
              {t("allDecks")}
            </Link>
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.recentDecks.map((deck) => (
            <div key={deck.id} className="glass-control rounded-[24px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold">{deck.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {deck.wordCount} {t("words")} · {deck.dueCount} {t("due")}
                  </p>
                </div>
                <Badge variant="outline">{deck.progress}%</Badge>
              </div>
              <Progress className="mt-3" value={deck.progress} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function SummaryRow({label, value}: Readonly<{label: string; value: number | string}>) {
  return (
    <div className="glass-control flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}
