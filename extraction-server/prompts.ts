export const EXTRACT_SYSTEM_PROMPT = `Extract structured data from the user's text and fill it into the fields by responding with the 'extract' function. Only fill out fields for which there is information in the user's text. If there is not enough information to fill out a field, omit the field.`;

export const EXTRACT_SUMMARY_PROMPT = `At the end, summarize any surprises or challenges of the extraction task. Name any fields you omitted and why, any assumptions made, and any ambiguities. Be very direct, concise, and brief.`;

export const EXTRACT_FUNCTION_PROMPT = `Extract the properties from the user's text and fill them into the fields."`;
