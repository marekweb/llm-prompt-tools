import { ChatCompletionClient } from "./ChatCompletionClient";
import { ChatContext } from "./ChatContext";
import { createConversationServer } from "./server";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
config();
const port = process.env.PORT ?? 8080;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY");
}

const conversations = new Map<string, ChatContext>();
const client = new ChatCompletionClient({
  apiKey,
  model: "gpt-3.5-turbo",
});

const server = createConversationServer({
  port,
  async getConversation(id: string) {
    const conversation = conversations.get(id);
    if (!conversation) {
      return null;
    }
    return conversation.messages;
  },
  createConversation: async (agentId, message) => {
    const id = uuidv4();
    const conversation = new ChatContext(client);
    conversations.set(id, conversation);
    // TODO: use AgentId here.

    server.send(id, {
      type: "message",
      conversationId: id,
      state: "typing",
    });

    conversation.sendUserMessageAndAppend(message).then((response) => {
      server.send(id, {
        type: "message",
        conversationId: id,
        content: response,
      });
    });

    return id;
  },
  handleMessage: (conversationId, message) => {
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return;
    }
    const messageContent = message.content;
    conversation.sendUserMessageAndAppend(messageContent).then((response) => {
      server.send(conversationId, {
        type: "message",
        content: response,
      });
    });
  },
});
