"use client";

import {useLocale, useTranslations} from "next-intl";
import {Languages, Sparkles} from "lucide-react";
import {GlassCard} from "@/components/ui/glass-card";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {ThemeToggle} from "./theme-toggle";

export function SettingsPanel() {
  const t = useTranslations("Settings");
  const locale = useLocale();

  return (
    <div className="space-y-3">
      <GlassCard className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Languages className="size-5 text-primary" />
            {t("language")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LocaleOption label="English" active={locale === "en"} />
            <LocaleOption label="Українська" active={locale === "uk"} />
          </div>
      </GlassCard>
      <GlassCard className="flex items-center justify-between p-5">
          <Label>{t("theme")}</Label>
          <ThemeToggle />
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
            <Switch className="ml-auto" disabled />
          </div>
      </GlassCard>
    </div>
  );
}

function LocaleOption({label, active}: Readonly<{label: string; active: boolean}>) {
  return (
    <div
      className={
        active
          ? "rounded-2xl border border-primary/35 bg-primary/12 p-3 text-center text-sm font-bold text-primary shadow-sm"
          : "glass-control rounded-2xl p-3 text-center text-sm font-bold text-muted-foreground"
      }
    >
      {label}
    </div>
  );
}
