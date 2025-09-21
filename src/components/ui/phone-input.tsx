import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatPhoneNumber, validatePhone } from '@/lib/validations/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
}

export function PhoneInput({
  value = '',
  onValueChange,
  error,
  className,
  onChange,
  onBlur,
  ...props
}: PhoneInputProps) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  const isValid = validatePhone(internalValue);
  const showError = error || (!isValid && hasBlurred && internalValue.length > 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    
    setInternalValue(formattedValue);
    
    if (onValueChange) {
      onValueChange(formattedValue);
    }
    
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: formattedValue }
      };
      onChange(syntheticEvent);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasBlurred(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type="tel"
        value={internalValue}
        className={cn(
          className,
          showError && "border-destructive focus-visible:ring-destructive"
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="(555) 123-4567"
      />
      {showError && (
        <p className="text-sm text-destructive">
          {error || "Please enter a valid phone number"}
        </p>
      )}
    </div>
  );
}