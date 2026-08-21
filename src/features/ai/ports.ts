export type AIProviderId = "openrouter";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIResponseFormat = {
  schema: unknown;
  schemaName: string;
};

export type AICompletionRequest = {
  messages: AIMessage[];
  responseFormat?: AIResponseFormat;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

export type AICompletionMetadata = {
  requestedModel: string;
  returnedModel?: string;
  durationMs: number;
  modelAttempt?: number;
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string;
  httpStatus?: number;
  retryAfterMs?: number;
};

export type AICompletionResult = {
  content: string;
  metadata: AICompletionMetadata;
};

export type AIProviderErrorCode =
  | "timeout"
  | "rate_limited"
  | "server_error"
  | "http_error"
  | "incomplete_response"
  | "invalid_response";

export class AIProviderError extends Error {
  constructor(
    readonly code: AIProviderErrorCode,
    message: string,
    readonly metadata?: Partial<AICompletionMetadata>
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIProvider {
  readonly id: AIProviderId;
  isAvailable(): boolean;
  complete(request: AICompletionRequest): Promise<AICompletionResult>;
}
