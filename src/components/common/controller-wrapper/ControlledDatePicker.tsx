import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue
} from "react-hook-form";
import { CustomDatePicker } from "../form-components/CustomDatePicker";

export interface ControlledDatePickerProps<
  T extends FieldValues = FieldValues
> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  defaultValue?: PathValue<T, Path<T>>;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

export const ControlledDatePicker = <T extends FieldValues = FieldValues>({
  control,
  name,
  defaultValue,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  error = false,
  required = false,
  helperText = "",
  label,
  ...otherProps
}: ControlledDatePickerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange }, fieldState }) => (
        <CustomDatePicker
          value={value}
          onChange={onChange}
          error={error || !!fieldState.error}
          helperText={helperText || fieldState.error?.message || ""}
          disabled={disabled}
          readOnly={readOnly}
          fullWidth={fullWidth}
          required={required}
          label={label}
          {...otherProps}
        />
      )}
    />
  );
};
