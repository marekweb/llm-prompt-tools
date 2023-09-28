import { Message } from "./Message";
import type { JSONSchema4 } from "json-schema";

const OPENAI_API_URL = "https://api.openai.com";
const DEFAULT_TEMPERATURE = 0;

export interface ChatCompletionFunction {
  name: string;
  description?: string;

  /**
   * A JSON Schema object
   */
  parameters?: JSONSchema4;
}

interface ChatCompletionRequest extends ChatCompletionOptions {
  model: string;
  messages: Message[];
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices?: {
    message: Message;
    finish_reason:
      | "stop"
      | "length"
      | "content_filter"
      | "function_call"
      | "null";
    index: number;
  }[];
}

interface ChatCompletionClientOptions {
  apiKey: string;
  model: string;
}
export interface ChatCompletionOptions {
  temperature?: number;
  stop?: string[];
  topP?: number;
  functions?: ChatCompletionFunction[];
  function_call?: "auto" | "none" | string;
}

function getLastMessageFromResponse(response: ChatCompletionResponse): Message {
  const choices = response.choices;
  if (!choices) {
    throw new Error("No choices returned");
  }
  return choices[0]?.message;
}

function getLastMessageContent(
  response: ChatCompletionResponse
): string | null {
  return getLastMessageFromResponse(response).content;
}

async function makeChatCompletionRequest(
  apiKey: string,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  if (!apiKey) {
    throw new Error("Missing API key");
  }
  const url = new URL("/v1/chat/completions", OPENAI_API_URL);
  console.log("--- Making request ---  ");
  console.log(JSON.stringify(request, null, 2));
  console.log("--- End of request ---  ");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as ChatCompletionResponse;
  console.log("--- Response ---  ");
  console.log(JSON.stringify(data, null, 2));
  console.log("--- End of response ---  ");
  return data;
}

export class ChatCompletionClient {
  private model: string;
  private openaiApiKey: string;
  // TODO put these in an object
  private defaultCompletionOptions: ChatCompletionOptions;

  constructor(
    clientOptions: ChatCompletionClientOptions,
    defaultCompletionOptions?: ChatCompletionOptions
  ) {
    this.model = clientOptions.model;
    this.openaiApiKey = clientOptions.apiKey;
    this.defaultCompletionOptions = defaultCompletionOptions ?? {};
  }

  getChatCompletion(
    messages: Message[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: this.model,
      messages: messages,
      temperature: DEFAULT_TEMPERATURE,
      ...this.defaultCompletionOptions,
      ...options,
    };
    return makeChatCompletionRequest(this.openaiApiKey, request);
  }

  async getSingleCompletionForInput(
    userMessage: string,
    systemMessage?: string
  ): Promise<string | null> {
    const messages: Message[] = [];
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    }
    messages.push({ role: "user", content: userMessage });
    const response = await this.getChatCompletion(messages);
    return getLastMessageContent(response);
  }
}
