import { Message } from "./Message";

const OPENAI_API_URL = "https://api.openai.com";
const DEFAULT_TEMPERATURE = 0;

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  stop?: string[];
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    message: Message;
    finish_reason: "stop" | "length" | "content_filter" | "null";
    index: number;
  }[];
}

interface ChatCompletionClientOptions {
  apiKey: string;
  model: "gpt-3.5-turbo";
}
interface ChatCompletionOptions {
  temperature?: number;
  stop?: string[];
  topP?: number;
}

function getLastMessageFromResponse(response: ChatCompletionResponse): Message {
  return response.choices[0]?.message;
}

function getLastMessageContent(response: ChatCompletionResponse): string {
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
  return data;
}

export class ChatCompletionClient {
  private model: string;
  private openaiApiKey: string;
  // TODO put these in an object
  private temperature: number;
  private stop: string[] | undefined;

  constructor(options: ChatCompletionClientOptions & ChatCompletionOptions) {
    this.model = options.model;
    this.openaiApiKey = options.apiKey;
    // Defaults
    this.temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    this.stop = options.stop;
  }

  getChatCompletion(
    messages: Message[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: this.model,
      messages: messages,
      temperature: options.temperature ?? this.temperature,
      stop: options.stop ?? this.stop,
    };
    return makeChatCompletionRequest(this.openaiApiKey, request);
  }

  async getSingleCompletionForInput(
    userMessage: string,
    systemMessage?: string
  ): Promise<string> {
    const messages: Message[] = [];
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    }
    messages.push({ role: "user", content: userMessage });
    const response = await this.getChatCompletion(messages);
    return getLastMessageContent(response);
  }
}
