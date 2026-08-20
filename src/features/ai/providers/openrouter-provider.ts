import "server-only";

import {z} from "zod";
import type {
  AICompletionRequest,
  AICompletionMetadata,
  AICompletionResult,
  AIProvider
} from "@/features/ai/ports";
import {AIProviderError} from "@/features/ai/ports";

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const openRouterResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable().optional(),
        message: z.object({
          content: z.string().nullable()
        })
      })
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional()
    })
    .optional()
});

type OpenRouterProviderOptions = {
  apiKey?: string;
  model: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;

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

    let lastError: AIProviderError | null = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await this.completeOnce(request, attempt);
      } catch (error) {
        if (!(error instanceof AIProviderError)) {
          throw error;
        }

        lastError = error;
        if (attempt >= MAX_ATTEMPTS || !shouldRetry(error)) {
          throw error;
        }

        logOpenRouterEvent("warn", "retry", {
          ...error.metadata,
          attempt,
          errorCode: error.code
        });
      }
    }

    throw lastError ?? new Error("OpenRouter request failed.");
  }

  private async completeOnce(
    request: AICompletionRequest,
    attempt: number
  ): Promise<AICompletionResult> {
    const startedAt = Date.now();
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const baseMetadata = {
      requestedModel: this.options.model
    };

    let response: Response;
    try {
      response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.options.apiKey ?? ""}`,
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
          reasoning: {
            effort: "none",
            exclude: true
          },
          temperature: request.temperature ?? 0,
          ...(request.topP === undefined ? {} : {top_p: request.topP}),
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
    } catch (error) {
      clearTimeout(timeout);
      const durationMs = Date.now() - startedAt;
      const code = isAbortError(error) ? "timeout" : "http_error";
      const providerError = new AIProviderError(
        code,
        code === "timeout" ? "OpenRouter request timed out." : "OpenRouter request failed.",
        {...baseMetadata, durationMs}
      );
      logOpenRouterEvent("warn", "request_error", {
        ...providerError.metadata,
        attempt,
        errorCode: providerError.code
      });
      throw providerError;
    } finally {
      clearTimeout(timeout);
    }

    const durationMs = Date.now() - startedAt;
    const metadataBase: AICompletionMetadata = {
      ...baseMetadata,
      durationMs,
      httpStatus: response.status
    };

    if (!response.ok) {
      const code = response.status === 429
        ? "rate_limited"
        : response.status >= 500
          ? "server_error"
          : "http_error";
      const providerError = new AIProviderError(
        code,
        `OpenRouter request failed with status ${response.status}.`,
        metadataBase
      );
      logOpenRouterEvent("warn", "http_error", {
        ...providerError.metadata,
        attempt,
        errorCode: providerError.code
      });
      throw providerError;
    }

    const raw = await response.json();
    const parsed = openRouterResponseSchema.safeParse(raw);
    if (!parsed.success) {
      const providerError = new AIProviderError(
        "invalid_response",
        "OpenRouter returned an unexpected response shape.",
        metadataBase
      );
      logOpenRouterEvent("error", "invalid_response", {
        ...providerError.metadata,
        attempt,
        zodValidationErrors: parsed.error.issues
      });
      throw providerError;
    }

    const completion = parsed.data;
    const firstChoice = completion.choices[0];
    if (!firstChoice) {
      const providerError = new AIProviderError(
        "invalid_response",
        "OpenRouter returned no choices.",
        metadataBase
      );
      logOpenRouterEvent("error", "invalid_response", {
        ...providerError.metadata,
        attempt
      });
      throw providerError;
    }

    const metadata: AICompletionMetadata = {
      ...metadataBase,
      ...(completion.model ? {returnedModel: completion.model} : {}),
      ...(completion.usage?.prompt_tokens === undefined
        ? {}
        : {inputTokens: completion.usage.prompt_tokens}),
      ...(completion.usage?.completion_tokens === undefined
        ? {}
        : {outputTokens: completion.usage.completion_tokens}),
      ...(firstChoice.finish_reason ? {finishReason: firstChoice.finish_reason} : {})
    };

    logOpenRouterEvent("info", "complete", {
      ...metadata,
      attempt
    });

    if (firstChoice.finish_reason === "length") {
      throw new AIProviderError(
        "incomplete_response",
        "OpenRouter response stopped because it reached the max token limit.",
        metadata
      );
    }

    if (!firstChoice.message.content) {
      throw new AIProviderError(
        "invalid_response",
        "OpenRouter returned an empty completion.",
        metadata
      );
    }

    return {
      content: firstChoice.message.content,
      metadata
    };
  }
}

function shouldRetry(error: AIProviderError) {
  return ["timeout", "rate_limited", "server_error"].includes(error.code);
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function logOpenRouterEvent(
  level: "info" | "warn" | "error",
  event: string,
  payload: Record<string, unknown>
) {
  console[level](
    JSON.stringify({
      source: "ai.openrouter",
      event,
      ...payload
    })
  );
}
