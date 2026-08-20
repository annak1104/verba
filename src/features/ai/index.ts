import "server-only";

import {env} from "@/env";
import type {AIProvider} from "@/features/ai/ports";
import {OpenRouterProvider} from "@/features/ai/providers/openrouter-provider";
import {AIService} from "@/features/ai/service";

let service: AIService | undefined;

export function getAIService() {
  service ??= new AIService({
    enabled: env.AI_ENABLED,
    provider: createProvider()
  });

  return service;
}

export function isAIAvailable() {
  return getAIService().isAvailable();
}

function createProvider(): AIProvider | null {
  if (env.AI_PROVIDER === "openrouter") {
    return new OpenRouterProvider({
      model: env.OPENROUTER_MODEL,
      ...(env.OPENROUTER_API_KEY ? {apiKey: env.OPENROUTER_API_KEY} : {})
    });
  }

  return null;
}
