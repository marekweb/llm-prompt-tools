export interface StructuredDataDefinition {
  id: string;
  name: string;
  fields: StructuredDataField[];
}

export interface StructuredDataField {
  key: string;
  description: string;
  kind: "name" | "amount" | "date" | "number" | "price" | "boolean";
  unit?: string;
}
