import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ValidatedSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function ValidatedSelect({
  value,
  onValueChange,
  placeholder,
  options,
  error,
  className,
  disabled,
}: ValidatedSelectProps) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            className,
            error && "border-destructive focus:ring-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}