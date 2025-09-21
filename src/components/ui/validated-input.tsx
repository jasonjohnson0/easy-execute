import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

export function ValidatedInput({ 
  validation, 
  errorMessage, 
  className, 
  onChange, 
  ...props 
}: ValidatedInputProps) {
  const [isValid, setIsValid] = useState(true);
  const [hasBlurred, setHasBlurred] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (validation) {
      setIsValid(validation(value));
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
      <Input
        {...props}
        className={cn(
          className,
          showError && "border-destructive focus-visible:ring-destructive"
        )}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {showError && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}