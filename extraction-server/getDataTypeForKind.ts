import { JSONSchema4 } from "json-schema";
import { StructuredDataField } from "../common/StructuredDataDefinition";

export function getDataTypeForKind(
  kind: StructuredDataField["kind"]
): JSONSchema4["type"] {
  switch (kind) {
    case "amount":
    case "number":
    case "price":
      return "number";
    case "boolean":
      return "boolean";
    case "name":
    case "date":
    default:
      return "string";
  }
}
