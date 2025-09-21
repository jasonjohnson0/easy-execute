import { useValidatedForm } from './useValidatedForm';
import { 
  signInSchema, 
  signUpSchema, 
  businessSignUpSchema,
  SignInData,
  SignUpData,
  BusinessSignUpData
} from '@/lib/validations/schemas';

export function useSignInForm(defaultValues?: Partial<SignInData>) {
  return useValidatedForm({
    schema: signInSchema,
    defaultValues: {
      email: '',
      password: '',
      ...defaultValues,
    },
  });
}

export function useSignUpForm(defaultValues?: Partial<SignUpData>) {
  return useValidatedForm({
    schema: signUpSchema,
    defaultValues: {
      email: '',
      password: '',
      ...defaultValues,
    },
  });
}

export function useBusinessSignUpForm(defaultValues?: Partial<BusinessSignUpData>) {
  return useValidatedForm({
    schema: businessSignUpSchema,
    defaultValues: {
      email: '',
      password: '',
      businessName: '',
      businessEmail: '',
      ...defaultValues,
    },
  });
}