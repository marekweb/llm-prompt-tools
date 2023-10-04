import React, { useCallback, useEffect, useState } from "react";
import {
  StructuredDataDefinition,
  StructuredDataField,
} from "../../common/StructuredDataDefinition";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { getDefs, saveDef } from "./api";
import FieldEditor from "./FieldEditor";
import { SelectField } from "./components/SelectField";

interface DefinitionEditorProps {}

export const DefinitionEditor: React.FunctionComponent<
  DefinitionEditorProps
> = () => {
  const [defs, setDefs] = useState<StructuredDataDefinition[] | undefined>();
  const [currentDefId, setCurrentDefId] = useState<string>();

  const def = defs?.find((def) => def.id === currentDefId);

  const setDef = (def: StructuredDataDefinition) => {
    if (!defs) {
      return;
    }
    const newDefs = defs.map((d) => (d.id === def.id ? def : d));
    setDefs(newDefs);
  };

  // On first render, load defs from API
  useEffect(() => {
    getDefs().then((defs) => {
      setDefs(defs);
      setCurrentDefId(defs[0].id);
    });
  }, []);

  const updateField = useCallback(
    (field: StructuredDataField, index: number) => {
      if (!def) {
        return;
      }
      const newDef = { ...def };
      newDef.fields[index] = field;
      setDef(newDef);
    },
    [def, setDef]
  );

  const handleSave = useCallback(() => {
    if (!def) {
      return;
    }
    saveDef(def);
  }, [def]);

  const handleDelete = useCallback(
    (index: number) => {
      if (!def) {
        return;
      }
      const newDef = { ...def };
      newDef.fields.splice(index, 1);
      setDef(newDef);
    },
    [def, setDef]
  );

  const handleAddField = useCallback(() => {
    if (!def) {
      return;
    }
    const newDef = { ...def };
    newDef.fields.push({
      key: "",
      description: "",
      kind: "name",
    });
    setDef(newDef);
  }, [def, setDef]);

  if (!defs || !currentDefId) {
    return null;
  }
  if (!def) {
    return null;
  }

  return (
    <div>
      <Card>
        <SelectField
          label="Select structured data definition"
          value={currentDefId}
          options={defs.map((def) => def.id)}
          onChange={setCurrentDefId}
        />
        <p>Name: {def?.name}</p>
        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </Card>

      <div>
        {def.fields.map((field, index) => (
          <Card key={index}>
            <button
              className="float-right text-sm hover:underline text-blue-500"
              onClick={() => handleDelete(index)}
            >
              Delete
            </button>
            <FieldEditor field={field} index={index} onChange={updateField} />
          </Card>
        ))}
        <div
          onClick={handleAddField}
          className="text-center py-12 my-12 hover:bg-gray-300 max-w-lg mx-auto rounded-lg cursor-pointer"
        >
          Add Field
        </div>
      </div>
    </div>
  );
};

export default DefinitionEditor;
