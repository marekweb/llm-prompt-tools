import express from "express";
import { Server as WebSocketServer, WebSocket } from "ws";
import { Server, createServer } from "http";
import { AddressInfo } from "net";
import { Message } from "../src/Message";
import {
  SocketMessageFromClient,
  SocketMessageFromServer,
  parseSocketMessageFromClient,
} from "./socket-messages";

interface SocketConnection {
  conversationId?: string;
  socket: WebSocket;
  lastActive: number;
}

type OptionallyAsync<F> = F extends (...args: infer A) => infer T
  ? (...args: A) => Promise<Awaited<T>> | Awaited<T>
  : never;

type HandleMessageFromClient = (
  conversationId: string,
  message: SocketMessageFromClient
) => void;
type SendMessageToClient = (
  conversationId: string,
  message: SocketMessageFromServer
) => void;

interface CreateServerOptions {
  port: number;
  createConversation: OptionallyAsync<
    (agentId: string, message: string) => string
  >;
  getConversation: (conversationId: string) => Promise<null | Message[]>;
  handleMessage: OptionallyAsync<HandleMessageFromClient>;
}

interface ConversationServer {
  send: SendMessageToClient;
  app: express.Application;
  server: Server;
  wss: WebSocketServer;
}

function removeItem<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

function sendMessage(socket: WebSocket, message: SocketMessageFromServer) {
  socket.send(JSON.stringify(message));
}

export function createConversationServer(
  options: CreateServerOptions
): ConversationServer {
  const app = express();
  const server = createServer(app);

  const connections: SocketConnection[] = [];

  // Websocket server
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    const socketConnectionRecord: SocketConnection = {
      socket: ws,
      lastActive: Date.now(),
    };
    connections.push(socketConnectionRecord);

    ws.on("message", async (rawMessage) => {
      socketConnectionRecord.lastActive = Date.now();
      const message = parseSocketMessageFromClient(rawMessage.toString());
      if (!message) {
        sendMessage(ws, {
          type: "message",
          state: "error",
          content: "error: bad message",
        });
        return;
      }

      switch (message.type) {
        case "message":
          if (message.agentId) {
            const conversationId = await options.createConversation(
              message.agentId,
              message.content
            );
            socketConnectionRecord.conversationId = conversationId;
            // TODO: We could reply something here, like the conversation ID,
            // but instead we wait until there's an actual message to send.
            // TODO: createConversation could return an object that contains an
            // immediate value (the conversation ID) and a promise (the first
            // message from the assistant).
            return;
          }

          if (!message.conversationId) {
            sendMessage(ws, {
              type: "message",
              state: "error",
              content: "error: no conversation ID",
            });
            return;
          }

          options.handleMessage(message.conversationId, message);
      }
    });
    // Handle client disconnection
    ws.on("close", () => {
      // Remove form connections array
      removeItem(connections, socketConnectionRecord);
    });
  });

  // Serve index.html
  app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
  });

  app.get("/api/conversations/:id", (req, res) => {
    // Returns the history of a conversation.
    const id = req.params.id;
    const conversation = options.getConversation(id);
    if (!conversation) {
      res.status(404).send("Conversation not found");
      return;
    }
    res.send({ conversation });
  });

  app.get("/api/conversations", (req, res) => {
    // TODO: implement
    res.send([]);
  });

  // Start server
  server.listen(options.port, () => {
    const address = server.address() as AddressInfo;
    console.log(
      `WebSocket server running on ${address.family}://${address.address}:${address.port}`
    );
  });

  function send(conversationId: string, message: SocketMessageFromServer) {
    const connectionsForConversation = connections.filter(
      (c) => c.conversationId === conversationId
    );
    connectionsForConversation.forEach((connection) => {
      sendMessage(connection.socket, message);
    });
  }

  return {
    send,
    app,
    server,
    wss,
  };
}
