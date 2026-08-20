"use client";

import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Languages, Sparkles, ArrowLeftRight} from "lucide-react";
import {GlassCard} from "@/components/ui/glass-card";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
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
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold">{t("ai")}</div>
              <p className="text-sm leading-6 text-muted-foreground">{t("aiDescription")}</p>
            </div>
            <Switch
              checked={aiEnabled}
              className="ml-auto"
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
          </div>
      </GlassCard>
    </div>
  );
}
