import "server-only";

import {toJSONSchema, type ZodType} from "zod";
import type {AIMessage, AIProvider} from "@/features/ai/ports";

export type AIGenerateObjectRequest<T> = {
  messages: AIMessage[];
  schema: ZodType<T>;
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
};

type AIServiceOptions = {
  enabled: boolean;
  provider: AIProvider | null;
};

export class AIService {
  constructor(private readonly options: AIServiceOptions) {}

  isAvailable() {
    return this.options.enabled && Boolean(this.options.provider?.isAvailable());
  }

  async generateObject<T>(request: AIGenerateObjectRequest<T>): Promise<T | null> {
    if (!this.isAvailable() || !this.options.provider) {
      return null;
    }

    try {
      const completion = await this.options.provider.complete({
        messages: request.messages,
        responseFormat: {
          schema: toJSONSchema(request.schema),
          schemaName: request.schemaName
        },
        ...(request.temperature === undefined
          ? {}
          : {temperature: request.temperature}),
        ...(request.maxTokens === undefined ? {} : {maxTokens: request.maxTokens})
      });
      const json = JSON.parse(completion.content) as unknown;
      const parsed = request.schema.safeParse(json);

      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
}
