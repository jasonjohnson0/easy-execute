import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validation?: (value: string) => boolean;
  errorMessage?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function ValidatedTextarea({
  validation,
  errorMessage,
  maxLength,
  showCharCount = false,
  className,
  onChange,
  value,
  ...props
}: ValidatedTextareaProps) {
  const [isValid, setIsValid] = useState(true);
  const [hasBlurred, setHasBlurred] = useState(false);

  const currentLength = typeof value === 'string' ? value.length : 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (validation) {
      setIsValid(validation(newValue));
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = () => {
    setHasBlurred(true);
  };

  const showError = !isValid && hasBlurred;

  return (
    <div className="space-y-1">
      <Textarea
        {...props}
        value={value}
        className={cn(
          className,
          showError && "border-destructive focus-visible:ring-destructive"
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center">
        {showError && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        {showCharCount && maxLength && (
          <p className={cn(
            "text-sm text-muted-foreground ml-auto",
            currentLength > maxLength * 0.9 && "text-warning",
            currentLength === maxLength && "text-destructive"
          )}>
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}