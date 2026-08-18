import {getTranslations} from "next-intl/server";
import {GlassCard} from "@/components/ui/glass-card";
import {Progress} from "@/components/ui/progress";

type Stats = {
  learned: number;
  reviews: number;
  retention: number;
  total: number;
};

export async function ProgressOverview({stats}: Readonly<{stats: Stats}>) {
  const t = await getTranslations("Stats");

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <GlassCard className="space-y-5 p-5 sm:col-span-3 lg:col-span-1">
        <div>
          <div className="text-sm font-semibold text-muted-foreground">{t("retention")}</div>
          <div className="mt-2 text-4xl font-bold">{stats.retention}%</div>
        </div>
          <Progress value={stats.retention} />
      </GlassCard>
      <StatCard label={t("learned")} value={`${stats.learned}/${stats.total}`} />
      <StatCard label={t("reviews")} value={stats.reviews} />
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
