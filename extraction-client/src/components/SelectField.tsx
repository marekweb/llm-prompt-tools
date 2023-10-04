import React from "react";

export const SelectField: React.FunctionComponent<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}> = (props) => (
  <div className="py-4">
    <label className="block text-sm font-medium text-gray-900">
      {props.label}
    </label>
    <div className="mt-2">
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
      >
        {props.options.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </div>
  </div>
);
