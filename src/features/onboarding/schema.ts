import {z} from "zod";

export const onboardingSchema = z.object({
  englishLevel: z.enum(["beginner", "elementary", "intermediate", "advanced"]),
  dailyGoalPreset: z.enum(["5", "10", "20", "custom"]),
  customDailyGoal: z.coerce.number().int().min(1).max(200).optional(),
  learningDirection: z.enum(["english_to_ukrainian", "ukrainian_to_english"]),
  pronunciationPreference: z.enum(["ukrainian", "ipa", "both"])
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export function resolveDailyGoal(input: OnboardingInput) {
  if (input.dailyGoalPreset === "custom") {
    return input.customDailyGoal ?? 10;
  }

  return Number(input.dailyGoalPreset);
}
