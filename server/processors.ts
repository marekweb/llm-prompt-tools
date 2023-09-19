import { ChatContext } from "./ChatContext";
import { executeScript } from "../src/executeScript";
import { extractCodeBlock } from "../src/extractCodeBlock";

function extractLabeledSection(label: string, message: string): string | null {
  // Labeled sections start with a label followed by a colon
  // and end with a newline.
  const regex = new RegExp(`^${label}: (.*)\n`, "m");
  const match = message.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}

function postprocess(
  chatContext: ChatContext,
  state: Record<string, unknown>,
  message: string
): string {
  // Extract code block
  const code = extractCodeBlock(message);

  // Extract labeled section
  const label = extractLabeledSection("Message", message);

  // TODO
  return message;
}
