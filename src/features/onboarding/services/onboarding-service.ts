import {redirect} from "next/navigation";
import type {Route} from "next";
import {requireAuthUserId, syncInternalUser} from "@/features/auth/services/auth-service";
import {resolveDailyGoal, type OnboardingInput} from "@/features/onboarding/schema";

const onboardingRoute = "/onboarding" as Route;
const todayRoute = "/today" as Route;

export async function ensureOnboardingReady() {
  const userId = await requireAuthUserId();
  await syncInternalUser(userId);

  const {SettingsRepository} = await import("@/features/settings/repositories/settings-repository");
  const settings = await new SettingsRepository().ensureForUser(userId);

  return {userId, settings};
}

export async function requireCompletedOnboarding() {
  const {settings} = await ensureOnboardingReady();

  if (!settings.onboardingCompletedAt) {
    redirect(onboardingRoute);
  }

  const {DrizzleVocabularyRepository} = await import(
    "@/features/vocabulary/repositories/vocabulary-repository"
  );
  await new DrizzleVocabularyRepository().ensureDefaultDeck(settings.userId);

  return settings;
}

export async function redirectIfOnboarded() {
  const {settings} = await ensureOnboardingReady();

  if (settings.onboardingCompletedAt) {
    redirect(todayRoute);
  }

  return settings;
}

export async function completeOnboarding(input: OnboardingInput) {
  const userId = await requireAuthUserId();
  await syncInternalUser(userId);

  const {SettingsRepository} = await import("@/features/settings/repositories/settings-repository");

  await new SettingsRepository().completeOnboarding(userId, {
    dailyGoal: resolveDailyGoal(input),
    englishLevel: input.englishLevel,
    learningDirection: input.learningDirection,
    pronunciationPreference: input.pronunciationPreference
  });

  const {DrizzleVocabularyRepository} = await import(
    "@/features/vocabulary/repositories/vocabulary-repository"
  );
  await new DrizzleVocabularyRepository().ensureDefaultDeck(userId);
}
