import type {LucideIcon} from "lucide-react";
import {GlassCard} from "@/components/ui/glass-card";

export function MetricCard({
  icon: Icon,
  label,
  value
}: Readonly<{icon: LucideIcon; label: string; value: number | string}>) {
  return (
    <GlassCard interactive className="flex h-28 flex-col justify-between p-4">
      <div className="grid size-9 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
        <div>
        <div className="text-3xl font-bold leading-8">{value}</div>
        <div className="truncate text-[11px] font-semibold text-muted-foreground">{label}</div>
        </div>
    </GlassCard>
  );
}
