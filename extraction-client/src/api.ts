import { StructuredDataDefinition } from "../../common/StructuredDataDefinition";

const apiUrl = localStorage.getItem("apiUrl") ?? "http://localhost:8080";

export async function getDefs() {
  const response = await fetch(`${apiUrl}/api/defs`);
  if (!response.ok) {
    throw new Error("Failed to get defs");
  }
  const defs: StructuredDataDefinition[] = await response.json();
  return defs;
}

export async function getDefByIdFromApi(
  id: string
): Promise<StructuredDataDefinition> {
  const response = await fetch(`${apiUrl}/api/defs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to get def");
  }
  const def: StructuredDataDefinition = await response.json();
  return def;
}

export async function saveDef(def: StructuredDataDefinition): Promise<void> {
  const response = await fetch(`${apiUrl}/api/defs/${def.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(def),
  });
  if (!response.ok) {
    throw new Error("Failed to save def");
  }
  return response.json();
}
