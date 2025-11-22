import { useEffect, useState } from "react";
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
  value?: string;
  onChange?: (value: string) => void;
}

export function SelectWithOther({
  name,
  label,
  options,
  required,
  otherLabel = "Other",
  placeholder = "Select an option",
  className,
  value,
  onChange,
}: SelectWithOtherProps) {
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [otherValue, setOtherValue] = useState("");
  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelectChange = (val: string) => {
    setSelectedValue(val);
    setShowOther(val === otherLabel);
    if (val !== otherLabel) {
      onChange?.(val);
    }
  };

  const handleOtherChange = (val: string) => {
    setOtherValue(val);
    onChange?.(val);
  };

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium mb-1">{label}</Label>}
      <div className="relative">
        <select
          name={name}
          value={selectedValue}
          required={required}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--brand-coral,#FF6B61)]/40 bg-white/85 backdrop-blur-sm px-3 py-3 text-sm shadow-sm outline-none transition
                     focus:border-[var(--brand-coral,#FF6B61)] focus:ring-2 focus:ring-[var(--brand-coral,#FF6B61)]/30
                     hover:border-[var(--brand-coral,#FF6B61)]"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
          <option value={otherLabel}>{otherLabel}</option>
        </select>
      </div>
      {showOther && (
        <div className="mt-3">
          <Input
            name={`${name}_other`}
            placeholder={`Enter ${otherLabel.toLowerCase()}`}
            required
            value={otherValue}
            onChange={(e) => handleOtherChange(e.target.value)}
            className="px-3 py-3 bg-white/85 backdrop-blur-sm focus:border-[var(--brand-coral,#FF6B61)] focus:ring-2 focus:ring-[var(--brand-coral,#FF6B61)]/30"
          />
        </div>
      )}
    </div>
  );
}
