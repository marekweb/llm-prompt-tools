import {
  ChatCompletionClient,
  ChatCompletionOptions,
  ChatCompletionResponse,
} from "./ChatCompletionClient";
import { Message } from "./Message";

interface FunctionCall<T = object> {
  name: string;
  arguments: T;
}

/** By convention if the function returns a string, we follow up with a "function" role response to API. Otherwise if the function returns null then we
 *
 */
type CallableFunction = (
  fn: FunctionCall
) => (string | null) | Promise<string | null | undefined>;

export class ChatContext {
  private client: ChatCompletionClient;
  private callFunction?: CallableFunction;
  public messages: Message[] = [];

  constructor(client: ChatCompletionClient, callFunction?: CallableFunction) {
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
    return this.sendMessageAndGetCompletion({ role: "user", content });
  }

  async sendMessageAndGetCompletion(
    message: Message,
    options?: ChatCompletionOptions
  ): Promise<Message> {
    this.appendMessage(message);
    const response = await this.client.getChatCompletion(
      this.messages,
      options
    );
    const responseMessage = getMessageFromResponse(response);

    if (responseMessage.function_call) {
      const functionCallName = responseMessage.function_call.name;
      const functionCallArgumentsJSON = responseMessage.function_call.arguments;
      const functionCallArguments = JSON.parse(functionCallArgumentsJSON);
      if (!this.callFunction) {
        throw new Error(
          `Function call "${functionCallName}" received but no function call handler is set.`
        );
      }
      const functionReturnValue = await this.callFunction({
        name: functionCallName,
        arguments: functionCallArguments,
      });

      if (functionReturnValue) {
        // Recursion in case the function returns another function call.
        return this.sendMessageAndGetCompletion({
          role: "function",
          content: functionReturnValue,
        });
      }
    }

    console.log("+++ Assistant:\n", message?.content);
    return message;
  }

  /**
   * Send user message, append the response to the messages, and return the response.
   * Note that the response may be null (@TODO document in which cases this is possible)
   */
  async sendUserMessageAndAppend(content: string): Promise<string | null> {
    const assistantMessage = await this.sendUserMessage(content);
    if (!assistantMessage) {
      throw new Error("No assistant message");
    }
    // Expected be an "assistant" message but should not assume that.
    this.appendMessage(assistantMessage);
    return assistantMessage.content;
  }
}

function getMessageFromResponse(response: ChatCompletionResponse): Message {
  const choices = response.choices;
  if (!choices) {
    throw new Error("No choices returned in chat completion response.");
  }
  if (choices.length !== 1) {
    throw new Error(
      `Expected exactly 1 choice, but recevied ${choices.length} in chat completion response.`
    );
  }
  return choices[0].message;
}
