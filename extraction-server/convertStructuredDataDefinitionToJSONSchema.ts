import { JSONSchema4 } from "json-schema";
import { StructuredDataField } from "../common/StructuredDataDefinition";
import { getDataTypeForKind } from "./getDataTypeForKind";

export function convertStructuredDataDefinitionToJSONSchema(
  definitions: StructuredDataField[]
): { type: "object"; properties: Record<string, JSONSchema4> } {
  const properties: Record<string, JSONSchema4> = {};
  for (const definition of definitions) {
    let description = definition.description;
    if (definition.unit) {
      description += ` (${definition.kind} in ${definition.unit})`;
    } else {
      description += ` (${definition.kind})`;
    }
    description += ". Omit if unknown.";

    properties[definition.key] = {
      type: getDataTypeForKind(definition.kind),
      description,
    };
  }

  return {
    type: "object",
    properties,
  };
}
