import { useValidatedForm } from './useValidatedForm';
import { dealSchema, DealData } from '@/lib/validations/schemas';

export function useDealForm(defaultValues?: Partial<DealData>) {
  return useValidatedForm({
    schema: dealSchema,
    defaultValues: {
      title: '',
      description: '',
      discount_type: 'percentage' as const,
      discount_value: '',
      terms: '',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      ...defaultValues,
    },
  });
}