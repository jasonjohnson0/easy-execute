import { z } from 'zod';
import { sanitizeInput, sanitizeHTML, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitization';

// Business categories from existing code
const BUSINESS_CATEGORIES = [
  'Restaurant', 'Retail', 'Services', 'Health & Beauty', 'Entertainment',
  'Automotive', 'Home & Garden', 'Technology', 'Travel', 'Other'
] as const;

// Utility validation functions
const validatePhone = (phone: string) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validateCoordinate = (coord: number, type: 'lat' | 'lng') => {
  if (type === 'lat') return coord >= -90 && coord <= 90;
  return coord >= -180 && coord <= 180;
};

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(sanitizeEmail),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .transform(sanitizeInput),
});

export const signUpSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(sanitizeEmail),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .transform(sanitizeInput),
});

export const businessSignUpSchema = signUpSchema.extend({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters')
    .transform(sanitizeInput),
  businessEmail: z.string()
    .email('Please enter a valid business email')
    .toLowerCase()
    .transform(sanitizeEmail),
});

// Business profile schema
export const businessProfileSchema = z.object({
  name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters')
    .transform(sanitizeInput),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(sanitizeEmail),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .transform(sanitizeHTML)
    .optional(),
  category: z.enum(BUSINESS_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid business category' })
  }),
  address: z.string()
    .min(10, 'Please enter a complete address')
    .max(200, 'Address must be less than 200 characters')
    .transform(sanitizeInput),
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .refine(validatePhone, 'Please enter a valid phone number')
    .transform(sanitizePhone),
  logo_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// Deal creation schema
export const dealSchema = z.object({
  title: z.string()
    .min(5, 'Deal title must be at least 5 characters')
    .max(100, 'Deal title must be less than 100 characters')
    .transform(sanitizeInput),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .transform(sanitizeHTML),
  discount_type: z.enum(['percentage', 'fixed', 'bogo'], {
    errorMap: () => ({ message: 'Please select a discount type' })
  }),
  discount_value: z.string()
    .min(1, 'Please enter a discount value')
    .transform(sanitizeInput),
  terms: z.string()
    .min(5, 'Terms must be at least 5 characters')
    .max(300, 'Terms must be less than 300 characters')
    .transform(sanitizeHTML),
  expires_at: z.date({
    required_error: 'Please select an expiration date',
    invalid_type_error: 'Please enter a valid date'
  })
    .min(new Date(), 'Expiration date must be in the future')
    .max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'Expiration date cannot be more than 1 year in the future'),
}).refine((data) => {
  if (data.discount_type === 'percentage') {
    const value = parseFloat(data.discount_value);
    return value > 0 && value <= 99;
  } else if (data.discount_type === 'fixed') {
    const value = parseFloat(data.discount_value);
    return value > 0 && value <= 10000;
  } else if (data.discount_type === 'bogo') {
    return data.discount_value.trim().length > 0;
  }
  return true;
}, {
  message: 'Percentage discounts must be between 1-99%, fixed discounts must be between $1-$10,000, BOGO must have a description',
  path: ['discount_value']
});

// Business hours schema
export const businessHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  is_closed: z.boolean(),
  open_time: z.string().nullable(),
  close_time: z.string().nullable(),
}).refine((data) => {
  if (data.is_closed) return true;
  
  if (!data.open_time || !data.close_time) {
    return false;
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(data.open_time) || !timeRegex.test(data.close_time)) {
    return false;
  }
  
  const [openHour, openMin] = data.open_time.split(':').map(Number);
  const [closeHour, closeMin] = data.close_time.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return closeMinutes > openMinutes;
}, {
  message: 'Close time must be after open time, and times must be in HH:MM format'
});

// Location schema
export const locationSchema = z.object({
  latitude: z.number()
    .refine((lat) => validateCoordinate(lat, 'lat'), 'Latitude must be between -90 and 90'),
  longitude: z.number()
    .refine((lng) => validateCoordinate(lng, 'lng'), 'Longitude must be between -180 and 180'),
  timezone: z.string()
    .min(1, 'Please select a timezone'),
});

// Type exports
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type BusinessSignUpData = z.infer<typeof businessSignUpSchema>;
export type BusinessProfileData = z.infer<typeof businessProfileSchema>;
export type DealData = z.infer<typeof dealSchema>;
export type BusinessHoursData = z.infer<typeof businessHoursSchema>;
export type LocationData = z.infer<typeof locationSchema>;