import { ReactNode } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ControlledTextFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  defaultValue?: PathValue<T, Path<T>>;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  startAdornment?: string | ReactNode;
  endAdornment?: string | ReactNode;
  fullWidth?: boolean;
  min?: string;
  error?: boolean;
  helperText?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  autoComplete?: string;
  inputMode?:
    | "none"
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "numeric"
    | "decimal";
  pattern?: string;
}

export const ControlledTextField = <T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  startAdornment,
  endAdornment,
  fullWidth = true,
  min,
  inputMode,
  pattern,
  error,
  helperText,
  type = "text",
  autoComplete,
  ...otherProps
}: ControlledTextFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <div
          className={`flex flex-col gap-1 ${fullWidth ? "w-full" : "w-fit"}`}
        >
          {label && (
            <Label
              className="text-sm font-medium text-gray-700 mb-1"
              htmlFor={name}
            >
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          )}
          <div className="relative flex items-center">
            {startAdornment && (
              <span className="absolute left-3 text-gray-400">
                {startAdornment}
              </span>
            )}
            <Input
              {...field}
              id={name}
              type={type}
              disabled={disabled}
              readOnly={readOnly}
              min={min}
              inputMode={inputMode}
              pattern={pattern}
              autoComplete={autoComplete}
              className={`bg-white border-0 focus:ring-2 focus:ring-primary/30 shadow-none pr-3 ${
                startAdornment ? "pl-10" : "pl-3"
              } ${endAdornment ? "pr-10" : ""} ${
                error || fieldState.error ? "ring-2 ring-red-500" : ""
              } ${fullWidth ? "w-full" : ""} h-12`}
              {...otherProps}
            />
            {endAdornment && (
              <span className="absolute right-3 text-gray-400">
                {endAdornment}
              </span>
            )}
          </div>
          {(helperText || fieldState.error?.message) && (
            <span
              className={`text-xs mt-1 ${
                error || fieldState.error ? "text-red-500" : "text-gray-500"
              }`}
            >
              {helperText || fieldState.error?.message}
            </span>
          )}
        </div>
      )}
    />
  );
};
