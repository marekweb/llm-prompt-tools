export interface SocketMessageFromClient {
  type: "message";
  conversationId?: string;
  agentId?: string;
  content: string;
}

export interface SocketMessageFromServer {
  type: "message";
  conversationId?: string;
  state?: "error" | "typing";
  content?: string;
}

function isSocketMessageFromClient(
  object: unknown
): object is SocketMessageFromClient {
  if (typeof object !== "object" || object === null) {
    return false;
  }

  const { type, content, conversationId, agentId } =
    object as Partial<SocketMessageFromClient>;

  const isValidType = type === "message";
  const isValidContent = typeof content === "string";
  const isValidConversationId =
    typeof conversationId === "string" || conversationId === undefined;
  const isValidAgentId = typeof agentId === "string" || agentId === undefined;

  return (
    isValidType && isValidContent && isValidConversationId && isValidAgentId
  );
}

export function parseSocketMessageFromClient(
  jsonString: string
): SocketMessageFromClient | null {
  if (!jsonString || !jsonString.trim()) {
    return null;
  }

  try {
    const parsedObject = JSON.parse(jsonString.trim());
    return isSocketMessageFromClient(parsedObject) ? parsedObject : null;
  } catch (error) {
    return null;
  }
}
