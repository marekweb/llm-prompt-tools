export interface SocketMessageFromClient {
    type: "message" | "conversation";
    content: string;
}

export interface SocketMessageFromServer {
    type: 'message' | 'state'
    conversationId: string;
    content: string;
}


function isSocketMessageFromClient(obj: unknown): obj is SocketMessageFromClient {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        ("message" === (obj as { type?: unknown }).type || "conversation" === (obj as { type?: unknown }).type) &&
        "content" in obj &&
        typeof (obj as { content?: unknown }).content === "string"
    );
}


export function parseSocketMessageFromClient(jsonString: string): SocketMessageFromClient | null {
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