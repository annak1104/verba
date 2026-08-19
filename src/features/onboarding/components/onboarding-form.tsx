"use client";

import {useActionState} from "react";
import {useTranslations} from "next-intl";
import {ArrowRight, BookOpenCheck, Goal, Languages, Volume2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GlassCard} from "@/components/ui/glass-card";
import {Input} from "@/components/ui/input";
import {submitOnboarding} from "@/features/onboarding/actions";
import {cn} from "@/lib/utils";

export function OnboardingForm() {
  const t = useTranslations("Onboarding");
  const [state, formAction, pending] = useActionState(submitOnboarding, {error: null});
  const levelOptions = [
    {value: "beginner", label: t("levels.beginner")},
    {value: "elementary", label: t("levels.elementary")},
    {value: "intermediate", label: t("levels.intermediate")},
    {value: "advanced", label: t("levels.advanced")}
  ];
  const goalOptions = [
    {value: "5", label: "5"},
    {value: "10", label: "10"},
    {value: "20", label: "20"},
    {value: "custom", label: t("goals.custom")}
  ];
  const pronunciationOptions = [
    {value: "ukrainian", label: t("pronunciation.ukrainian")},
    {value: "ipa", label: t("pronunciation.ipa")},
    {value: "both", label: t("pronunciation.both")}
  ];
  const directionOptions = [
    {value: "english_to_ukrainian", label: t("directions.enUk")},
    {value: "ukrainian_to_english", label: t("directions.ukEn")}
  ];

  return (
    <GlassCard className="space-y-7 p-5 sm:p-7">
      <div className="space-y-3">
        <div className="grid size-14 place-items-center rounded-[24px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <BookOpenCheck className="size-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <ChoiceGroup
          icon={BookOpenCheck}
          legend={t("englishLevel")}
          name="englishLevel"
          options={levelOptions}
          defaultValue="beginner"
        />

        <div className="space-y-3">
          <ChoiceGroup
            icon={Goal}
            legend={t("dailyGoal")}
            name="dailyGoalPreset"
            options={goalOptions}
            defaultValue="10"
          />
          <Input
            inputMode="numeric"
            min={1}
            max={200}
            name="customDailyGoal"
            placeholder={t("customGoal")}
            type="number"
          />
        </div>

        <ChoiceGroup
          icon={Languages}
          legend={t("learningDirection")}
          name="learningDirection"
          options={directionOptions}
          defaultValue="english_to_ukrainian"
        />

        <ChoiceGroup
          icon={Volume2}
          legend={t("pronunciationPreference")}
          name="pronunciationPreference"
          options={pronunciationOptions}
          defaultValue="ukrainian"
        />

        {state.error ? (
          <p className="rounded-2xl bg-destructive/12 p-3 text-sm font-medium text-destructive">
            {t("error")}
          </p>
        ) : null}

        <Button className="h-13 w-full text-base" disabled={pending} type="submit">
          {t("continue")}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </GlassCard>
  );
}

function ChoiceGroup({
  icon: Icon,
  legend,
  name,
  options,
  defaultValue
}: Readonly<{
  icon: typeof BookOpenCheck;
  legend: string;
  name: string;
  options: Array<{value: string; label: string}>;
  defaultValue: string;
}>) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {legend}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label key={option.value} className="group cursor-pointer">
            <input
              className="peer sr-only"
              defaultChecked={option.value === defaultValue}
              name={name}
              type="radio"
              value={option.value}
            />
            <span
              className={cn(
                "glass-control flex min-h-12 items-center justify-center rounded-2xl px-3 text-center text-sm font-bold text-muted-foreground transition duration-200 group-active:scale-[0.98]",
                "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:shadow-lg peer-checked:shadow-primary/20"
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
