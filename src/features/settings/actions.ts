"use server";

import {revalidatePath} from "next/cache";
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
