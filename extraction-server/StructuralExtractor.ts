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
import { validate } from "json-schema";

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

    parameters.properties = parameters.properties ?? {};
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
    const structuredData = tryParseJson(structuredJSON);
    const validationResult = validate(structuredData, parameters);
    if (!validationResult.valid) {
      throw new Error("Function call parameters do not match schema");
    }
    return structuredData;
  }
}

function tryParseJson(json: string): any {
  try {
    return JSON.parse(json);
  } catch {
    throw new Error("Not valid JSON in function call");
  }
}
