export interface Message {
  role: "system" | "assistant" | "user" | "function";
  content: string | null;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface MessageWithMetadata extends Message {
  hide?: boolean;
  tokenCount?: number;
}
