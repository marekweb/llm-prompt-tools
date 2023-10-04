import {
  ChatCompletionClient,
  ChatCompletionOptions,
} from "../server/ChatCompletionClient";
import { MessageWithContent } from "../server/Message";
import {
  getMessageFromResponse,
  isMessageWithFunctionCall,
} from "../server/ChatContext";
import { StructuredDataField } from "../common/StructuredDataDefinition";
import { convertStructuredDataDefinitionToJSONSchema } from "./convertStructuredDataDefinitionToJSONSchema";
import {
  EXTRACT_FUNCTION_PROMPT,
  EXTRACT_SUMMARY_PROMPT,
  EXTRACT_SYSTEM_PROMPT,
} from "./prompts";

export class StructuralExtractor {
  private client: ChatCompletionClient;
  private structuredDataDefinition: StructuredDataField[];

  constructor(
    client: ChatCompletionClient,
    structuredDataDefinition: StructuredDataField[]
  ) {
    this.client = client;
    this.structuredDataDefinition = structuredDataDefinition;
  }

  async extract(input: string): Promise<Record<string, string>> {
    const messages: MessageWithContent[] = [
      {
        role: "system",
        content: EXTRACT_SYSTEM_PROMPT,
      },
      { role: "user", content: input },
    ];

    const parameters = convertStructuredDataDefinitionToJSONSchema(
      this.structuredDataDefinition
    );

    parameters.properties.task_summary = {
      description: EXTRACT_SUMMARY_PROMPT,
      type: "string",
    };

    const options: ChatCompletionOptions = {
      functions: [
        {
          name: "extract",
          description: EXTRACT_FUNCTION_PROMPT,
          parameters: { ...parameters, required: ["task_summary"] },
        },
      ],
      function_call: { name: "extract" },
    };
    const result = await this.client.getChatCompletion(messages, options);
    const message = getMessageFromResponse(result);
    if (!isMessageWithFunctionCall(message)) {
      throw new Error("Expected function call");
    }
    const structuredJSON = message.function_call.arguments;
    const structuredData = JSON.parse(structuredJSON);
    return structuredData;
  }
}
