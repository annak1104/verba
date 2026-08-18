import {auth} from "@clerk/nextjs/server";
import type {CompleteLearningSessionInput} from "../repositories/learning-session-repository";

export async function startLearningSession() {
  const {userId} = await auth.protect();

  const {LearningSessionRepository} = await import("../repositories/learning-session-repository");
  return new LearningSessionRepository().startOrResume(userId);
}

export async function completeLearningSession(
  input: Omit<CompleteLearningSessionInput, "ownerId">
) {
  const {userId} = await auth.protect();

  const {LearningSessionRepository} = await import("../repositories/learning-session-repository");
  return new LearningSessionRepository().complete({...input, ownerId: userId});
}
