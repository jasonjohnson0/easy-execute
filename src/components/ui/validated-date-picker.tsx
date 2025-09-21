import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ValidatedDatePickerProps {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function ValidatedDatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  error,
  disabled,
  minDate,
  maxDate,
  className,
}: ValidatedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onValueChange?.(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="space-y-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}