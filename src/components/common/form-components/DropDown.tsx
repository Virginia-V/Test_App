import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  required?: boolean;
  options?: DropdownOption[];
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  error = false,
  helperText = "",
  label = "Select an Option",
  fullWidth = true,
  required = false,
  options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ]
}) => {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : "w-fit"}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={options.length === 0}
      >
        <SelectTrigger
          className={`bg-white border-0 focus:ring-2 focus:ring-primary/30 shadow-none rounded-md cursor-pointer ${
            error ? "border-red-500" : ""
          } ${fullWidth ? "w-full" : ""} !h-12 min-h-[3rem] leading-[3rem]`}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && (
        <span
          className={`text-xs mt-1 ${error ? "text-red-500" : "text-gray-500"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
