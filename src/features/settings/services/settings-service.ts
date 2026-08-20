import {auth} from "@clerk/nextjs/server";
import {isAIAvailable} from "@/features/ai";
import type {UpdateUserSettingsInput} from "../repositories/settings-repository";

export async function getUserSettings() {
  const {userId} = await auth.protect();

  const {SettingsRepository} = await import("../repositories/settings-repository");
  return new SettingsRepository().ensureForUser(userId);
}

export async function updateUserSettings(input: UpdateUserSettingsInput) {
  const {userId} = await auth.protect();

  const {SettingsRepository} = await import("../repositories/settings-repository");
  return new SettingsRepository().update(userId, input);
}

export async function isUserAIAssistanceAvailable() {
  const settings = await getUserSettings();
  return isAIAvailable() && settings.aiEnabled;
}
