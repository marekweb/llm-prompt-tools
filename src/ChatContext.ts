import { ChatCompletionClient } from "./ChatCompletionClient";
import { Message } from "./Message";

export class ChatContext {
  private client: ChatCompletionClient;
  public messages: Message[] = [];

  constructor(client: ChatCompletionClient) {
    this.client = client;
  }

  appendMessage(message: Message) {
    this.messages.push(message);
  }

  appendMessageWithRole(
    role: "system" | "assistant" | "user",
    content: string
  ) {
    this.appendMessage({ role, content });
  }

  appendUserMessage(content: string) {
    this.appendMessageWithRole("user", content);
  }

  appendAssistantMessage(content: string) {
    this.appendMessageWithRole("assistant", content);
  }

  appendSystemMessage(content: string) {
    this.appendMessageWithRole("system", content);
  }

  async sendUserMessage(content: string) {
    this.appendUserMessage(content);
    const response = await this.client.getChatCompletion(this.messages);
    return response.choices[0]?.message;
  }

  async sendUserMessageAndAppend(content: string): Promise<string> {
    const assistantMessage = await this.sendUserMessage(content);
    if (!assistantMessage) {
      throw new Error("No assistant message");
    }
    // Expected be an "assistant" message but should not assume that.
    this.appendMessage(assistantMessage);
    return assistantMessage.content;
  }
}
