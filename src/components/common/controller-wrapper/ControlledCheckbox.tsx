import { ReactNode } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface ControlledCheckboxProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string | ReactNode;
  defaultValue?: PathValue<T, Path<T>>;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export const ControlledCheckbox = <T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  defaultValue,
  required = false,
  disabled = false,
  error,
  helperText
}: ControlledCheckboxProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
              className="cursor-pointer"
            />
            <Label
              htmlFor={name}
              className="text-xs text-gray-800 cursor-pointer"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          {(helperText || fieldState.error?.message) && (
            <span
              className={`text-xs ${
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
