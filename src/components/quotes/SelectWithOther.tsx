import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface SelectWithOtherProps {
  name: string;
  label?: string;
  options: string[];
  required?: boolean;
  otherLabel?: string;
  placeholder?: string;
  className?: string;
}

export function SelectWithOther({
  name,
  label,
  options,
  required,
  otherLabel = "Other",
  placeholder = "Select an option",
  className,
}: SelectWithOtherProps) {
  const [val, setVal] = useState("");
  const showOther = val === "__other";
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <select
        name={name}
        value={val}
        required={required}
        onChange={(e) => setVal(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="__other">{otherLabel}</option>
      </select>
      {showOther && (
        <div className="mt-2">
          <Input
            name={`${name}_other`}
            placeholder={`Enter ${otherLabel.toLowerCase()}`}
            required
          />
        </div>
      )}
    </div>
  );
}
