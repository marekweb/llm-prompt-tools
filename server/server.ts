import express from "express";
import { config } from "dotenv";
import { Server as WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { AddressInfo } from "net";
import { v4 as uuidv4 } from "uuid";

interface SocketMessage {
  type: string;
  id?: string;
  content?: string;
}

interface ConnectionContext {
  id: string;
  socket: WebSocket[];
  lastActive: number;
  conversation: string; // TODO
}

// This is a type guard for string | undefined | null
function isString(value: unknown): value is string | undefined {
  return typeof value === "string" || value === undefined;
}

function parseMessageAsSocketMessage(jsonString: string): SocketMessage | null {
  try {
    const parsed = JSON.parse(jsonString);

    // Check if 'type' is a string and exists
    if (typeof parsed.type !== "string") {
      return null;
    }

    // Check if 'id' is a string, undefined, or not present
    if (parsed.id !== undefined && !isString(parsed.id)) {
      return null;
    }

    // Check if 'content' is a string, undefined, or not present
    if (parsed.content !== undefined && !isString(parsed.content)) {
      return null;
    }

    return parsed as SocketMessage;
  } catch (error) {
    return null;
  }
}

config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Websocket server
const wss = new WebSocketServer({ server });

const connections = new Map<string, ConnectionContext>();

function send(id: string, message: string) {
  const connectionContext = connections.get(id);
  if (!connectionContext) {
    console.warn(`No connection found for id ${id}`);
    return;
  }

  connectionContext.socket.forEach((socket) =>
    socket.send(
      JSON.stringify({
        id,
        type: "message",
        content: message,
      })
    )
  );
}

function handleMessage(id: string, message: string) {
  console.log(`Received message from ${id}: ${message}`);
}

wss.on("connection", (ws) => {
  // Handle incoming message
  ws.on("message", (message) => {
    const data = parseMessageAsSocketMessage(message.toString());
    if (!data) {
      return;
    }
    switch (data.type) {
      case "connect":
        const id = uuidv4();
        connections.set(id, {
          id,
          socket: [ws],
          lastActive: Date.now(),
          conversation: "",
        });
        ws.send(
          JSON.stringify({
            id,
            type: "connect",
            content: "Connected",
          })
        );
        break;
      case "reconnect":
        if (!data.id) {
          break;
        }
        const connectionContext = connections.get(data.id);
        if (!connectionContext) {
          break;
        }
        connectionContext.socket.push(ws);
        connectionContext.lastActive = Date.now(); // TODO: make this per-socket.
        ws.send(
          JSON.stringify({
            id: data.id,
            type: "reconnect",
            content: "Reconnected",
          })
        );
        break;

      case "message":
        if (!data.id || !data.content) {
          break;
        }
        handleMessage(data.id, data.content);
        break;

      default:
        // TODO: Handle unsupported message type
        console.warn(`Unsupported message type: ${data.type}`);
        break;
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    connections.forEach((value, key) => {
      removeItem(value.socket, ws);
    });
  });
});

function removeItem<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Start server
server.listen(PORT, () => {
  const address = server.address() as AddressInfo;
  console.log(`WebSocket server running on http://localhost:${address.port}`);
});
