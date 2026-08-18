import {eq} from "drizzle-orm";
import {db} from "@/db/client";
import {userSettings} from "@/db/schema";
import type {
  EnglishLevel,
  LearningDirection,
  PronunciationPreference,
  ThemePreference,
  UserSettings
} from "@/features/vocabulary/types";

export type UpdateUserSettingsInput = Partial<{
  dailyGoal: number;
  englishLevel: EnglishLevel;
  learningDirection: LearningDirection;
  pronunciationPreference: PronunciationPreference;
  soundEnabled: boolean;
  theme: ThemePreference;
  aiEnabled: boolean;
  onboardingCompletedAt: Date | null;
}>;

export class SettingsRepository {
  async getByUserId(userId: string): Promise<UserSettings | null> {
    const row = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId)
    });

    return row ? toSettings(row) : null;
  }

  async ensureForUser(userId: string): Promise<UserSettings> {
    const [row] = await db
      .insert(userSettings)
      .values({userId})
      .onConflictDoNothing()
      .returning();

    if (row) {
      return toSettings(row);
    }

    const existing = await this.getByUserId(userId);
    if (!existing) {
      throw new Error("Failed to create user settings.");
    }

    return existing;
  }

  async update(userId: string, input: UpdateUserSettingsInput): Promise<UserSettings> {
    const [row] = await db
      .update(userSettings)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    if (!row) {
      throw new Error("User settings not found.");
    }

    return toSettings(row);
  }

  async completeOnboarding(
    userId: string,
    input: Pick<
      UpdateUserSettingsInput,
      "dailyGoal" | "englishLevel" | "learningDirection" | "pronunciationPreference"
    >
  ): Promise<UserSettings> {
    await this.ensureForUser(userId);

    const [row] = await db
      .update(userSettings)
      .set({
        dailyGoal: input.dailyGoal,
        englishLevel: input.englishLevel,
        learningDirection: input.learningDirection,
        pronunciationPreference: input.pronunciationPreference,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    if (!row) {
      throw new Error("User settings not found.");
    }

    return toSettings(row);
  }
}

function toSettings(row: typeof userSettings.$inferSelect): UserSettings {
  return {
    userId: row.userId,
    dailyGoal: row.dailyGoal,
    englishLevel: row.englishLevel,
    learningDirection: row.learningDirection,
    pronunciationPreference: row.pronunciationPreference,
    soundEnabled: row.soundEnabled,
    theme: row.theme,
    aiEnabled: row.aiEnabled,
    onboardingCompletedAt: row.onboardingCompletedAt
  };
}
