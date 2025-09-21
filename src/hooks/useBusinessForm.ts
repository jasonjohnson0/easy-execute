import { useValidatedForm } from './useValidatedForm';
import { businessProfileSchema, BusinessProfileData } from '@/lib/validations/schemas';

export function useBusinessForm(defaultValues?: Partial<BusinessProfileData>) {
  return useValidatedForm({
    schema: businessProfileSchema,
    defaultValues: {
      name: '',
      email: '',
      description: '',
      category: 'Other' as const,
      address: '',
      phone: '',
      logo_url: '',
      ...defaultValues,
    },
  });
}