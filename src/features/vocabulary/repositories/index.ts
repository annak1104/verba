import {auth} from "@clerk/nextjs/server";

export async function getVocabularyRepository() {
  const {userId} = await auth.protect();

  const {DrizzleVocabularyRepository} = await import("./vocabulary-repository");

  return {
    userId,
    repository: new DrizzleVocabularyRepository()
  };
}
