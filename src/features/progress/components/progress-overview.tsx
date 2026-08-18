import {getTranslations} from "next-intl/server";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";
import type {ActivityDay, ProgressStats} from "@/features/progress/repositories/progress-repository";

export async function ProgressOverview({stats}: Readonly<{stats: ProgressStats}>) {
  const t = await getTranslations("Stats");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard label={t("accuracy")} value={`${stats.accuracy}%`} />
        <StatCard label={t("currentStreak")} value={stats.currentStreak} />
        <StatCard label={t("longestStreak")} value={stats.longestStreak} />
        <StatCard label={t("totalVocabulary")} value={stats.totalVocabulary} />
      </div>

      <GlassCard className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{t("memoryStates")}</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {stats.statusCounts.total} {t("totalWords")}
            </p>
          </div>
          <Badge variant="outline">{stats.statusCounts.mastered} {t("mastered")}</Badge>
        </div>
        <StateRow label={t("new")} value={stats.statusCounts.new} total={stats.statusCounts.total} />
        <StateRow label={t("learning")} value={stats.statusCounts.learning} total={stats.statusCounts.total} />
        <StateRow label={t("reviewing")} value={stats.statusCounts.reviewing} total={stats.statusCounts.total} />
        <StateRow label={t("mastered")} value={stats.statusCounts.mastered} total={stats.statusCounts.total} />
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <GlassCard className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{t("activityHeatmap")}</h2>
            <Badge variant="outline">{t("lastEightWeeks")}</Badge>
          </div>
          <ActivityHeatmap activity={stats.activity.heatmap} />
        </GlassCard>

        <GlassCard className="space-y-3 p-5">
          <h2 className="text-lg font-bold">{t("activity")}</h2>
          <StatLine label={t("sevenDays")} value={stats.activity.sevenDays} />
          <StatLine label={t("thirtyDays")} value={stats.activity.thirtyDays} />
          <StatLine label={t("allTime")} value={stats.activity.allTime} />
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
              <span className="text-muted-foreground">{t("dailyGoalCompletion")}</span>
              <span>{stats.dailyGoalCompletion}%</span>
            </div>
            <Progress value={stats.dailyGoalCompletion} />
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              {t("dailyGoal")} {stats.dailyGoal}
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4 p-5">
        <h2 className="text-lg font-bold">{t("deckProgress")}</h2>
        <div className="space-y-3">
          {stats.deckProgress.map((deck) => (
            <div key={deck.id} className="glass-control rounded-[24px] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold">{deck.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {deck.wordCount} {t("words")} · {deck.dueCount} {t("due")}
                  </p>
                </div>
                <Badge variant="outline">{deck.progress}%</Badge>
              </div>
              <Progress value={deck.progress} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground">
                <MiniStat label={t("learning")} value={deck.learningCount} />
                <MiniStat label={t("mastered")} value={deck.masteredCount} />
                <MiniStat label={t("due")} value={deck.dueCount} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({label, value}: Readonly<{label: string; value: number | string}>) {
  return (
    <GlassCard interactive className="p-5">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-4 text-4xl font-bold">{value}</div>
    </GlassCard>
  );
}

function StateRow({label, value, total}: Readonly<{label: string; value: number; total: number}>) {
  const progress = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-bold">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

function ActivityHeatmap({activity}: Readonly<{activity: ActivityDay[]}>) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
      {activity.map((day) => (
        <div
          key={day.date}
          className={cn("aspect-square rounded-md border border-border/40", heatClass(day.total))}
          title={`${day.date}: ${day.total}`}
        />
      ))}
    </div>
  );
}

function heatClass(total: number) {
  if (total >= 12) return "bg-primary";
  if (total >= 6) return "bg-primary/70";
  if (total >= 2) return "bg-primary/40";
  if (total >= 1) return "bg-primary/20";
  return "bg-muted/50";
}

function StatLine({label, value}: Readonly<{label: string; value: number}>) {
  return (
    <div className="glass-control flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}

function MiniStat({label, value}: Readonly<{label: string; value: number}>) {
  return (
    <div className="rounded-2xl bg-background/40 p-2">
      <div className="text-base text-foreground">{value}</div>
      <div>{label}</div>
    </div>
  );
}
