import React from "react";
import { Input } from "./input";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  onBlur,
  disabled,
  className,
}: TimePickerProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onChange(newTime);
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleTimeChange}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
    />
  );
} 