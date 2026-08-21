import "server-only";

import {z} from "zod";
import type {
  AICompletionRequest,
  AICompletionMetadata,
  AICompletionResult,
  AIResponseFormat,
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
  models?: string[];
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_MODEL_ATTEMPTS = 3;
const MAX_SAFE_LOG_STRING_LENGTH = 2_000;
const REQUEST_METHOD = "POST";
const REASONING_EFFORT = "low";

export class OpenRouterProvider implements AIProvider {
  readonly id = "openrouter" as const;
  private readonly models: string[];

  constructor(private readonly options: OpenRouterProviderOptions) {
    this.models = buildModelAttempts(options.model, options.models);
  }

  isAvailable() {
    return Boolean(this.options.apiKey) && this.models.length > 0;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    if (!this.options.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    let lastError: AIProviderError | null = null;
    for (const [index, model] of this.models.entries()) {
      const attempt = index + 1;
      try {
        return await this.completeOnce(request, attempt, model);
      } catch (error) {
        if (!(error instanceof AIProviderError)) {
          throw error;
        }

        lastError = error;
        const fallbackReason = getFallbackReason(error);
        const nextModel = this.models[index + 1];
        if (!fallbackReason || !nextModel) {
          throw error;
        }

        logOpenRouterEvent("warn", "fallback", {
          endpoint: OPENROUTER_CHAT_COMPLETIONS_URL,
          method: REQUEST_METHOD,
          model,
          ...error.metadata,
          attempt,
          status: error.metadata?.httpStatus,
          durationMs: error.metadata?.durationMs,
          finishReason: error.metadata?.finishReason ?? null,
          errorCode: error.code,
          fallbackReason,
          nextModel,
          nextAttempt: attempt + 1
        });

        if (fallbackReason === "rate_limited" && error.metadata?.retryAfterMs) {
          await sleep(error.metadata.retryAfterMs);
        }
      }
    }

    throw lastError ?? new Error("OpenRouter request failed.");
  }

  private async completeOnce(
    request: AICompletionRequest,
    attempt: number,
    model: string
  ): Promise<AICompletionResult> {
    const startedAt = Date.now();
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const baseMetadata = {
      requestedModel: model,
      modelAttempt: attempt
    };
    const responseFormat = this.buildResponseFormat(request.responseFormat, startedAt);
    const body = {
      model,
      messages: request.messages,
      stream: false,
      provider: {
        require_parameters: true
      },
      reasoning: {
        effort: REASONING_EFFORT,
        exclude: true
      },
      temperature: request.temperature ?? 0,
      ...(request.topP === undefined ? {} : {top_p: request.topP}),
      ...(request.maxTokens === undefined ? {} : {max_tokens: request.maxTokens}),
      ...(responseFormat ? {response_format: responseFormat} : {})
    };
    const requestLogMetadata = {
      endpoint: OPENROUTER_CHAT_COMPLETIONS_URL,
      method: REQUEST_METHOD,
      model,
      requestedModel: model,
      requestParameterNames: Object.keys(body)
    };

    let response: Response;
    try {
      response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
        method: REQUEST_METHOD,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.options.apiKey ?? ""}`,
          "Content-Type": "application/json",
          "X-Title": "Verba"
        },
        body: JSON.stringify(body)
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
        ...requestLogMetadata,
        ...providerError.metadata,
        attempt,
        status: providerError.metadata?.httpStatus,
        durationMs: providerError.metadata?.durationMs,
        finishReason: providerError.metadata?.finishReason ?? null,
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
      const safeErrorBody =
        response.status === 400 ? await readSafeResponseBody(response) : undefined;
      const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
      const code = response.status === 429
        ? "rate_limited"
        : response.status >= 500
          ? "server_error"
          : "http_error";
      const providerError = new AIProviderError(
        code,
        `OpenRouter request failed with status ${response.status}.`,
        {
          ...metadataBase,
          ...(retryAfterMs === undefined ? {} : {retryAfterMs})
        }
      );
      logOpenRouterEvent("warn", "http_error", {
        ...requestLogMetadata,
        ...providerError.metadata,
        attempt,
        status: response.status,
        durationMs,
        finishReason: null,
        errorCode: providerError.code,
        ...(safeErrorBody === undefined ? {} : {safeErrorBody})
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
        ...requestLogMetadata,
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
        ...requestLogMetadata,
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
      ...requestLogMetadata,
      ...metadata,
      status: metadata.httpStatus,
      attempt
    });

    if (firstChoice.finish_reason === "length") {
      logOpenRouterEvent("warn", "incomplete_response", {
        ...requestLogMetadata,
        ...metadata,
        attempt,
        errorCode: "incomplete_response"
      });
      throw new AIProviderError(
        "incomplete_response",
        "OpenRouter response stopped because it reached the max token limit.",
        metadata
      );
    }

    if (!firstChoice.message.content) {
      logOpenRouterEvent("error", "empty_completion", {
        ...requestLogMetadata,
        ...metadata,
        attempt,
        errorCode: "invalid_response"
      });
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

  private buildResponseFormat(
    responseFormat: AIResponseFormat | undefined,
    startedAt: number
  ) {
    if (!responseFormat) {
      return undefined;
    }

    if (!isJsonSchemaObject(responseFormat.schema)) {
      const providerError = new AIProviderError(
        "invalid_response",
        "OpenRouter structured output schema must be a JSON object.",
        {
          requestedModel: this.options.model,
          durationMs: Date.now() - startedAt
        }
      );
      logOpenRouterEvent("error", "invalid_request_schema", {
        endpoint: OPENROUTER_CHAT_COMPLETIONS_URL,
        method: REQUEST_METHOD,
        requestedModel: this.options.model,
        requestParameterNames: ["response_format"],
        errorCode: providerError.code
      });
      throw providerError;
    }

    return {
      type: "json_schema" as const,
      json_schema: {
        name: responseFormat.schemaName,
        strict: true,
        schema: responseFormat.schema
      }
    };
  }
}

function buildModelAttempts(primaryModel: string, fallbackModels: string[] | undefined) {
  const uniqueModels = new Set(
    [primaryModel, ...(fallbackModels ?? [])].map((model) => model.trim()).filter(Boolean)
  );

  return Array.from(uniqueModels).slice(0, MAX_MODEL_ATTEMPTS);
}

function getFallbackReason(error: AIProviderError) {
  if (error.code === "rate_limited") {
    return "rate_limited";
  }

  if (error.code === "timeout") {
    return "timeout";
  }

  if (error.code === "server_error") {
    return "provider_unavailable";
  }

  if (error.code === "http_error" && error.metadata?.httpStatus === undefined) {
    return "provider_unavailable";
  }

  return null;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isJsonSchemaObject(schema: unknown): schema is Record<string, unknown> {
  return Boolean(schema) && typeof schema === "object" && !Array.isArray(schema);
}

function parseRetryAfterMs(retryAfter: string | null) {
  if (!retryAfter) {
    return undefined;
  }

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryAt = Date.parse(retryAfter);
  if (Number.isNaN(retryAt)) {
    return undefined;
  }

  return Math.max(0, retryAt - Date.now());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readSafeResponseBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return "";
  }

  try {
    return sanitizeForLog(JSON.parse(text) as unknown);
  } catch {
    return truncateForLog(text);
  }
}

function sanitizeForLog(value: unknown): unknown {
  if (typeof value === "string") {
    return truncateForLog(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        isSensitiveLogKey(key) ? "[redacted]" : sanitizeForLog(entry)
      ])
    );
  }

  return value;
}

function isSensitiveLogKey(key: string) {
  return /authorization|api[-_]?key|openrouter_api_key|token|secret|password/i.test(key);
}

function truncateForLog(value: string) {
  if (value.length <= MAX_SAFE_LOG_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_SAFE_LOG_STRING_LENGTH)}...`;
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
