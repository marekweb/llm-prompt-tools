interface ExtractedCodeBlock {
  info: string;
  body: string;
}

export function extractCodeBlock(
  input: string
): ExtractedCodeBlock | undefined {
  const codeBlockPattern = /```(\w+)?\s*([\s\S]*?)\s*```/;
  const match = input.match(codeBlockPattern);

  if (!match) {
    return undefined;
  }

  const info = (match[1] || "").trim();
  const body = match[2];

  return { info, body };
}
