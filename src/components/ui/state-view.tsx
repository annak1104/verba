import type {LucideIcon} from "lucide-react";
import {AlertCircle, Inbox} from "lucide-react";
import {GlassCard} from "@/components/ui/glass-card";
import {cn} from "@/lib/utils";

export function EmptyState({
  title = "",
  description,
  icon: Icon = Inbox,
  className
}: Readonly<{
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}>) {
  return (
    <GlassCard className={cn("grid min-h-52 place-items-center p-6 text-center", className)}>
      <div className="space-y-3">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="size-6" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

export function ErrorState({
  title = "",
  description,
  className
}: Readonly<{title?: string; description?: string; className?: string}>) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="flex gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-destructive/12 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </GlassCard>
  );
}
