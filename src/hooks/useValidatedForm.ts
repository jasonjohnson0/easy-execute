import React, { useCallback, useState, useEffect } from 'react';
import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseValidatedFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

export function useValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  ...formProps
}: UseValidatedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...formProps,
  });

  const handleSubmit = useCallback(
    (submitFn?: (data: T) => void | Promise<void>) => {
      return form.handleSubmit(async (data) => {
        try {
          if (submitFn) {
            await submitFn(data);
          } else if (onSubmit) {
            await onSubmit(data);
          }
        } catch (error) {
          console.error('Form submission error:', error);
          // You might want to set form errors here based on the error
        }
      });
    },
    [form, onSubmit]
  );

  const getFieldError = useCallback(
    (fieldName: Path<T>) => {
      const fieldState = form.getFieldState(fieldName);
      return fieldState.error?.message;
    },
    [form]
  );

  const isFieldValid = useCallback(
    (fieldName: Path<T>) => {
      const fieldState = form.getFieldState(fieldName);
      return !fieldState.error && fieldState.isDirty;
    },
    [form]
  );

  return {
    ...form,
    handleSubmit,
    getFieldError,
    isFieldValid,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
}

// Utility hook for real-time validation
export function useRealtimeValidation<T extends FieldValues>(
  form: ReturnType<typeof useValidatedForm<T>>,
  fieldName: Path<T>,
  debounceMs = 300
) {
  const [isValidating, setIsValidating] = useState(false);
  
  const value = form.watch(fieldName);
  
  useEffect(() => {
    if (!value) return;
    
    setIsValidating(true);
    const timer = setTimeout(() => {
      form.trigger(fieldName);
      setIsValidating(false);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [value, fieldName, form, debounceMs]);
  
  return { isValidating };
}