"use server";

import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";
import {routing, type AppLocale} from "@/i18n/routing";
import {updateUserSettings} from "@/features/settings/services/settings-service";
import type {LearningDirection} from "@/features/vocabulary/types";

export async function updateLearningDirectionAction(direction: LearningDirection) {
  const normalizedDirection =
    direction === "ukrainian_to_english" ? "ukrainian_to_english" : "english_to_ukrainian";

  await updateUserSettings({learningDirection: normalizedDirection});
  revalidatePath("/review");
  revalidatePath("/learn");
  revalidatePath("/settings");
}

export async function updateLocaleAction(locale: AppLocale) {
  const nextLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const cookieStore = await cookies();

  cookieStore.set("NEXT_LOCALE", nextLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365
  });
}
