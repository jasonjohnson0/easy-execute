import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validateEmail, suggestEmailCorrection } from '@/lib/validations/utils';

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  showSuggestion?: boolean;
}

export function EmailInput({
  value = '',
  onValueChange,
  error,
  showSuggestion = true,
  className,
  onChange,
  onBlur,
  ...props
}: EmailInputProps) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  const isValid = validateEmail(internalValue);
  const suggestion = showSuggestion ? suggestEmailCorrection(internalValue) : null;
  const showError = error || (!isValid && hasBlurred && internalValue.length > 0);
  const showSuggestionText = suggestion && !isValid && hasBlurred && !error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().trim();
    setInternalValue(newValue);
    
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: newValue }
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

  const applySuggestion = () => {
    if (suggestion) {
      setInternalValue(suggestion);
      if (onValueChange) {
        onValueChange(suggestion);
      }
    }
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type="email"
        value={internalValue}
        className={cn(
          className,
          showError && "border-destructive focus-visible:ring-destructive"
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="you@example.com"
      />
      {showError && (
        <p className="text-sm text-destructive">
          {error || "Please enter a valid email address"}
        </p>
      )}
      {showSuggestionText && (
        <p className="text-sm text-muted-foreground">
          Did you mean{' '}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={applySuggestion}
          >
            {suggestion}
          </button>
          ?
        </p>
      )}
    </div>
  );
}