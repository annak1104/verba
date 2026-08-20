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
};

export type AICompletionResult = {
  content: string;
  model?: string;
};

export interface AIProvider {
  readonly id: AIProviderId;
  isAvailable(): boolean;
  complete(request: AICompletionRequest): Promise<AICompletionResult>;
}
