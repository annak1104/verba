import "server-only";

import {z} from "zod";
import type {
  AICompletionRequest,
  AICompletionResult,
  AIProvider
} from "@/features/ai/ports";

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const openRouterResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string()
        })
      })
    )
    .min(1)
});

type OpenRouterProviderOptions = {
  apiKey?: string;
  model: string;
};

export class OpenRouterProvider implements AIProvider {
  readonly id = "openrouter" as const;

  constructor(private readonly options: OpenRouterProviderOptions) {}

  isAvailable() {
    return Boolean(this.options.apiKey);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    if (!this.options.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Verba"
      },
      body: JSON.stringify({
        model: this.options.model,
        messages: request.messages,
        stream: false,
        provider: {
          require_parameters: true
        },
        ...(request.temperature === undefined
          ? {}
          : {temperature: request.temperature}),
        ...(request.maxTokens === undefined ? {} : {max_tokens: request.maxTokens}),
        ...(request.responseFormat
          ? {
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: request.responseFormat.schemaName,
                  strict: true,
                  schema: request.responseFormat.schema
                }
              }
            }
          : {})
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed with status ${response.status}.`);
    }

    const parsed = openRouterResponseSchema.parse(await response.json());
    const firstChoice = parsed.choices[0];
    if (!firstChoice) {
      throw new Error("OpenRouter returned no choices.");
    }

    return {
      content: firstChoice.message.content,
      ...(parsed.model ? {model: parsed.model} : {})
    };
  }
}
