import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue
} from "react-hook-form";
import { Dropdown, DropdownOption } from "../form-components/DropDown";
import { useTranslations } from "next-intl";

export interface ControlledDropdownProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: Path<T>;
  defaultValue?: PathValue<T, Path<T>>;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
}

export const ControlledDropdown = <T extends FieldValues = FieldValues>({
  control,
  name,
  defaultValue,
  error,
  required = false,
  helperText,
  label = "Select an Option",
  fullWidth = true,
  ...otherProps
}: ControlledDropdownProps<T>) => {
  const t = useTranslations();

  const dropdownOptions: DropdownOption[] = [
    { value: "priceQuote", label: t("form.dropdownOptions.priceQuote") },
    { value: "catalogue", label: t("form.dropdownOptions.catalogue") },
    { value: "priceList", label: t("form.dropdownOptions.priceList") },
    { value: "bimCad", label: t("form.dropdownOptions.bimCad") },
    { value: "resellerList", label: t("form.dropdownOptions.resellerList") },
    {
      value: "contactRepresentative",
      label: t("form.dropdownOptions.contactRepresentative")
    }
  ];

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Dropdown
          value={field.value}
          onChange={field.onChange}
          error={error ?? !!fieldState.error}
          helperText={helperText ?? fieldState.error?.message}
          options={dropdownOptions}
          label={label}
          fullWidth={fullWidth}
          required={required}
          {...otherProps}
        />
      )}
    />
  );
};

