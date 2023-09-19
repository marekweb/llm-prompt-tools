import { ChatCompletionClient } from "./ChatCompletionClient";
import { Message } from "./Message";

interface FunctionCall {
  name: string;
  arguments: any;
}

export class ChatContext {
  private client: ChatCompletionClient;
  private callFunction: (fn: FunctionCall) => Promise<unknown> | undefined;
  public messages: Message[] = [];

  constructor(
    client: ChatCompletionClient,
    callFunction?: (fn: FunctionCall) => Promise<unknown>
  ) {
    this.client = client;
    this.callFunction = callFunction;
  }

  appendMessage(message: Message) {
    this.messages.push(message);
  }

  appendMessageWithRole(
    role: "system" | "assistant" | "user" | "function",
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

  async sendUserMessage(content: string): Promise<Message> {
    this.appendUserMessage(content);
    const response = await this.client.getChatCompletion(this.messages);
    if (!response.choices?.length) {
      console.error("Here is the full response that caused the error below.");
      console.error("--- start of response ---");
      console.error(response);
      console.error("--- end of response ---");
      throw new Error(
        `Chat completion API response does not contain at least 1 item in "choices".`
      );
    }
    const message = response.choices[0]?.message;
    console.log("+++ Assistant:\n", message?.content);
    return message;
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
