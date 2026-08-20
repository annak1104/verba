import "server-only";

import {toJSONSchema, type ZodType} from "zod";
import {AIProviderError, type AICompletionMetadata, type AIMessage, type AIProvider} from "@/features/ai/ports";

export type AIGenerateObjectRequest<T> = {
  messages: AIMessage[];
  schema: ZodType<T>;
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

export type AIGenerateObjectSuccess<T> = {
  ok: true;
  data: T;
  metadata: AICompletionMetadata;
};

export type AIGenerateObjectFailure = {
  ok: false;
  code:
    | "disabled"
    | "timeout"
    | "rate_limited"
    | "server_error"
    | "http_error"
    | "incomplete_response"
    | "invalid_json"
    | "invalid_schema"
    | "invalid_response";
  metadata?: Partial<AICompletionMetadata>;
};

export type AIGenerateObjectResult<T> =
  | AIGenerateObjectSuccess<T>
  | AIGenerateObjectFailure;

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
    const result = await this.generateObjectResult(request);
    return result.ok ? result.data : null;
  }

  async generateObjectResult<T>(
    request: AIGenerateObjectRequest<T>
  ): Promise<AIGenerateObjectResult<T>> {
    if (!this.isAvailable() || !this.options.provider) {
      return {ok: false, code: "disabled"};
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
        ...(request.maxTokens === undefined ? {} : {maxTokens: request.maxTokens}),
        ...(request.topP === undefined ? {} : {topP: request.topP})
      });
      let json: unknown;
      try {
        json = JSON.parse(completion.content) as unknown;
      } catch (error) {
        logAIServiceEvent("error", "json_parse_error", {
          ...completion.metadata,
          jsonParseError: error instanceof Error ? error.message : String(error)
        });
        return {
          ok: false,
          code: "invalid_json",
          metadata: completion.metadata
        };
      }

      const parsed = request.schema.safeParse(json);
      if (!parsed.success) {
        logAIServiceEvent("error", "zod_validation_error", {
          ...completion.metadata,
          zodValidationErrors: parsed.error.issues
        });
        return {
          ok: false,
          code: "invalid_schema",
          metadata: completion.metadata
        };
      }

      return {
        ok: true,
        data: parsed.data,
        metadata: completion.metadata
      };
    } catch (error) {
      if (error instanceof AIProviderError) {
        return {
          ok: false,
          code: error.code,
          ...(error.metadata ? {metadata: error.metadata} : {})
        };
      }

      logAIServiceEvent("error", "unexpected_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      return {ok: false, code: "invalid_response"};
    }
  }
}

function logAIServiceEvent(
  level: "info" | "warn" | "error",
  event: string,
  payload: Record<string, unknown>
) {
  console[level](
    JSON.stringify({
      source: "ai.service",
      event,
      ...payload
    })
  );
}
