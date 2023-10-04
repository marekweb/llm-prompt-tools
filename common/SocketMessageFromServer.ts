export interface SocketMessageFromServer {
  type: "message";
  conversationId?: string;
  state?: "error" | "typing";
  content?: string;
}
