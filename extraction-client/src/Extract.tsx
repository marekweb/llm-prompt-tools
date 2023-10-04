import { useCallback, useEffect, useState } from "react";
import { Button } from "./components/Button";
import {
  StructuredDataDefinition,
  StructuredDataField,
} from "../../common/StructuredDataDefinition";
import { SelectField } from "./components/SelectField";

const apiServer = localStorage.getItem("apiServer") ?? "http://localhost:8080";

async function makeExtractApiCall(
  input: string,
  def: string
): Promise<Record<string, unknown>> {
  const apiServer =
    localStorage.getItem("apiServer") ?? "http://localhost:8080";
  const response = await fetch(apiServer + `/api/defs/${def}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      def,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to extract structured data");
  }

  const data: { result: Record<string, unknown> } = await response.json();
  return data.result;
}

async function getDefsFromApi(): Promise<StructuredDataDefinition[]> {
  const response = await fetch(apiServer + "/api/defs");
  if (!response.ok) {
    throw new Error("Failed to get defs");
  }
  const defs: StructuredDataDefinition[] = await response.json();
  return defs;
}

async function getDefByIdFromApi(
  id: string
): Promise<StructuredDataDefinition> {
  const response = await fetch(apiServer + `/api/defs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to get def");
  }
  const def: StructuredDataDefinition = await response.json();
  return def;
}

export const Extract: React.FunctionComponent = () => {
  const [defs, setDefs] = useState<StructuredDataDefinition[] | undefined>();
  const [currentDefId, setCurrentDefId] = useState<string>();
  //   const [fields, setFields] = useState<StructuredDataField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<Record<string, unknown> | undefined>();

  // On first render, load defs from API
  useEffect(() => {
    getDefsFromApi().then((defs) => {
      setDefs(defs);
      setCurrentDefId(defs[0].id);
    });
  }, []);

  const handleCopyAsJson = useCallback(() => {
    if (!data) {
      return;
    }
    const dataWithoutSummary = { ...data, task_summary: undefined };
    navigator.clipboard.writeText(JSON.stringify(dataWithoutSummary, null, 2));
  }, [data]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    if (!currentDefId) {
      setError("No definition selected");
      return;
    }

    try {
      const data = await makeExtractApiCall(inputText, currentDefId);
      setData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, currentDefId]);

  if (!defs || !currentDefId) {
    return null;
  }

  const hasDataSummary = data?.["task_summary"] !== undefined;
  const currentDef = defs.find((def) => def.id === currentDefId);

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="px-8 py-12 flex flex-col">
        <SelectField
          label="Select structured data definition"
          value={currentDefId}
          options={defs.map((def) => def.id)}
          onChange={setCurrentDefId}
        />
        <p>Name: {currentDef?.name}</p>
        <h1 className="font-bold text-xl py-4">Input text</h1>
        <p className="py-4">Paste your unstructured input text here.</p>
        {error && <div className="text-red-900">{error}</div>}
        <textarea
          disabled={isLoading}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="p-2 rounded-lg w-full box-border flex-grow disabled:opacity-50"
        ></textarea>
        <Button disabled={isLoading} onClick={handleSubmit} className="w-full">
          Extract
        </Button>
      </div>
      <div className="bg-gray-100 p-12">
        <DataDisplay data={data} fields={currentDef?.fields} />
        <Button onClick={handleCopyAsJson}>Copy as JSON</Button>
        {hasDataSummary && (
          <div className="mt-12">
            <h1 className="font-bold text-xl py-4">Comments</h1>
            {String(data["task_summary"])}
          </div>
        )}
      </div>
    </div>
  );
};

interface DataDisplayProps {
  fields?: StructuredDataField[];
  data?: Record<string, unknown>;
}

const DataDisplay: React.FunctionComponent<DataDisplayProps> = ({
  fields,
  data,
}) => (
  <div>
    {fields &&
      fields.map((field, i) => (
        <div key={i} className="my-4">
          <div className="uppercase font-bold text-sm">{field.key}</div>
          <div className="border p-2 border-gray-500 rounded-lg">
            {displayField(field, data) ?? <>&nbsp;</>}
          </div>
          {field.unit && <div className="text-sm">In {field.unit}</div>}
        </div>
      ))}
  </div>
);

function displayField(
  field: StructuredDataField,
  data?: Record<string, unknown>
): React.ReactNode {
  if (!data) {
    return null;
  }

  const value = data[field.key];
  if (value === undefined || value === null) {
    return null;
  }

  return String(value);

  return null;
}
