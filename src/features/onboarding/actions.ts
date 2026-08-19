"use server";

import {redirect} from "next/navigation";
import type {Route} from "next";
import {completeOnboarding} from "@/features/onboarding/services/onboarding-service";
import {onboardingSchema} from "@/features/onboarding/schema";

const todayRoute = "/today" as Route;

export type OnboardingActionState = {
  error: string | null;
};

export async function submitOnboarding(
  _state: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const parsed = onboardingSchema.safeParse({
    englishLevel: formData.get("englishLevel"),
    dailyGoalPreset: formData.get("dailyGoalPreset"),
    customDailyGoal:
      formData.get("customDailyGoal") === "" ? undefined : formData.get("customDailyGoal"),
    learningDirection: formData.get("learningDirection"),
    pronunciationPreference: formData.get("pronunciationPreference")
  });

  if (!parsed.success) {
    return {error: "invalid"};
  }

  await completeOnboarding(parsed.data);
  redirect(todayRoute);
}
