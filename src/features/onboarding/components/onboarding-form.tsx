"use client";

import {useActionState} from "react";
import {ArrowRight, BookOpenCheck, Goal, Languages, Volume2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GlassCard} from "@/components/ui/glass-card";
import {Input} from "@/components/ui/input";
import {submitOnboarding} from "@/features/onboarding/actions";
import {cn} from "@/lib/utils";

const levelOptions = [
  {value: "beginner", label: "Beginner"},
  {value: "elementary", label: "Elementary"},
  {value: "intermediate", label: "Intermediate"},
  {value: "advanced", label: "Advanced"}
];

const goalOptions = [
  {value: "5", label: "5"},
  {value: "10", label: "10"},
  {value: "20", label: "20"},
  {value: "custom", label: "Custom"}
];

const directionOptions = [
  {value: "english_to_ukrainian", label: "EN -> UK"},
  {value: "ukrainian_to_english", label: "UK -> EN"}
];

const pronunciationOptions = [
  {value: "ukrainian", label: "Ukrainian hints"},
  {value: "ipa", label: "IPA"},
  {value: "both", label: "Both"}
];

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(submitOnboarding, {error: null});

  return (
    <GlassCard className="space-y-7 p-5 sm:p-7">
      <div className="space-y-3">
        <div className="grid size-14 place-items-center rounded-[24px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <BookOpenCheck className="size-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Set up your English path</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A few choices tailor the daily queue. AI stays optional; the core study flow works without it.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <ChoiceGroup
          icon={BookOpenCheck}
          legend="English level"
          name="englishLevel"
          options={levelOptions}
          defaultValue="beginner"
        />

        <div className="space-y-3">
          <ChoiceGroup
            icon={Goal}
            legend="Daily goal"
            name="dailyGoalPreset"
            options={goalOptions}
            defaultValue="10"
          />
          <Input
            inputMode="numeric"
            min={1}
            max={200}
            name="customDailyGoal"
            placeholder="Custom goal"
            type="number"
          />
        </div>

        <ChoiceGroup
          icon={Languages}
          legend="Learning direction"
          name="learningDirection"
          options={directionOptions}
          defaultValue="english_to_ukrainian"
        />

        <ChoiceGroup
          icon={Volume2}
          legend="Pronunciation preference"
          name="pronunciationPreference"
          options={pronunciationOptions}
          defaultValue="ukrainian"
        />

        {state.error ? (
          <p className="rounded-2xl bg-destructive/12 p-3 text-sm font-medium text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button className="h-13 w-full text-base" disabled={pending} type="submit">
          Continue
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
