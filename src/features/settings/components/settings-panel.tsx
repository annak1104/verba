"use client";

import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {ArrowLeftRight, Languages, Sparkles} from "lucide-react";
import {GlassCard} from "@/components/ui/glass-card";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {cn} from "@/lib/utils";
import {DirectionToggle} from "@/features/review/components/direction-toggle";
import {normalizeReviewDirection} from "@/features/review/card-content";
import {updateAiEnabledAction} from "@/features/settings/actions";
import {LocaleSwitcher} from "@/features/settings/components/locale-switcher";
import type {UserSettings} from "@/features/vocabulary/types";
import {ThemeToggle} from "./theme-toggle";

export function SettingsPanel({settings}: Readonly<{settings: UserSettings}>) {
  const t = useTranslations("Settings");
  const [direction, setDirection] = useState(normalizeReviewDirection(settings.learningDirection));
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled);
  const [aiPending, startAiTransition] = useTransition();

  return (
    <div className="space-y-3">
      <GlassCard className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Languages className="size-5 text-primary" />
            {t("language")}
          </div>
          <LocaleSwitcher className="w-full" />
      </GlassCard>
      <GlassCard className="flex items-center justify-between p-5">
          <Label>{t("theme")}</Label>
          <ThemeToggle />
      </GlassCard>
      <GlassCard className="flex items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <ArrowLeftRight className="size-4 text-primary" />
            {t("learningDirection")}
          </div>
          <DirectionToggle value={direction} onValueChange={setDirection} />
      </GlassCard>
      <GlassCard className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
                aiEnabled
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/70 text-muted-foreground"
              )}
            >
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold">{t("ai")}</div>
              <p className="text-sm leading-6 text-muted-foreground">{t("aiDescription")}</p>
            </div>
            <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
              <Switch
                checked={aiEnabled}
                className={cn(
                  "border-border/80 shadow-inner shadow-black/10 data-[state=unchecked]:bg-muted data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-emerald-500/25 dark:data-[state=unchecked]:bg-zinc-700 dark:data-[state=checked]:bg-cyan-500"
                )}
                disabled={aiPending}
                aria-label={t("ai")}
                onCheckedChange={(checked) => {
                  setAiEnabled(checked);
                  startAiTransition(async () => {
                    try {
                      await updateAiEnabledAction(checked);
                    } catch {
                      setAiEnabled(!checked);
                    }
                  });
                }}
              />
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
                  aiEnabled
                    ? "bg-emerald-500/14 text-emerald-700 dark:bg-cyan-400/15 dark:text-cyan-200"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {aiEnabled ? t("aiStatusOn") : t("aiStatusOff")}
              </span>
            </div>
          </div>
      </GlassCard>
    </div>
  );
}
