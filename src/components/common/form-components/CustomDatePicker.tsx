import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

export interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  label?: string;
  required?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText = "",
  disabled = false,
  readOnly = false,
  fullWidth = true,
  required = false
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : "w-fit"}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start text-left font-normal !shadow-none ${
              error ? "border-red-500" : ""
            } ${fullWidth ? "w-full" : ""} h-12`}
            disabled={disabled || readOnly}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, "PPP")
            ) : (
              <span className="text-gray-400">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange(date ?? null);
              setOpen(false);
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
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
