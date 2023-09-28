export type Message =
  | MessageWithContent
  | MessageWithFunctionOutput
  | MessageWithFunctionCall;

interface MessageWithContent {
  role: "system" | "assistant" | "user";
  content: string;
}

interface MessageWithFunctionOutput {
  role: "function";
  name: string;
  content: string;
}

export interface MessageWithFunctionCall {
  role: "system";
  content: null;
  function_call: {
    name: string;
    arguments: string;
  };
}

export type MessageWithMetadata = Message & {
  hide?: boolean;
  tokenCount?: number;
};
