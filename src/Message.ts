export interface Message {
  role: "system" | "assistant" | "user";
  content: string;
}

export interface MessageWithMetadata extends Message {
  hide?: boolean;
  tokenCount?: number;
}
