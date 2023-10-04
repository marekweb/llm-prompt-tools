import { StructuredDataField } from "../../common/StructuredDataDefinition";
import { SelectField } from "./components/SelectField";
import { TextField } from "./components/TextField";

interface FieldEditorProps {
  field: StructuredDataField;
  index: number;
  onChange: (field: StructuredDataField, index: number) => void;
}
const FieldEditor: React.FunctionComponent<FieldEditorProps> = (props) => {
  return (
    <div>
      <SelectField
        label="Kind"
        value={props.field.kind}
        options={["name", "price", "amount", "boolean"]}
        onChange={(value) =>
          props.onChange({ ...props.field, kind: value }, props.index)
        }
      />
      <TextField
        label="Description"
        value={props.field.description}
        onChange={(value) =>
          props.onChange({ ...props.field, description: value }, props.index)
        }
      />
      <TextField
        label="Key"
        value={props.field.key}
        onChange={(value) =>
          props.onChange({ ...props.field, key: value }, props.index)
        }
      />
      <TextField
        label="Unit (optional)"
        value={props.field.unit ?? ""}
        onChange={(value) =>
          props.onChange(
            { ...props.field, unit: value === "" ? undefined : value },
            props.index
          )
        }
      />
    </div>
  );
};

export default FieldEditor;
