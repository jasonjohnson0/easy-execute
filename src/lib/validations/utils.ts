// Utility functions for form validation and data sanitization

export const sanitizeHTML = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format international numbers with country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if doesn't match expected patterns
  return phone;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(phone) && cleaned.length >= 10;
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateCoordinate = (coord: number, type: 'lat' | 'lng'): boolean => {
  if (type === 'lat') return coord >= -90 && coord <= 90;
  return coord >= -180 && coord <= 180;
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const normalizeAddress = (address: string): string => {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/,\s*,/g, ',') // Remove duplicate commas
    .replace(/\s*,\s*/g, ', '); // Normalize comma spacing
};

export const extractDomain = (email: string): string => {
  return email.split('@')[1]?.toLowerCase() || '';
};

export const suggestEmailCorrection = (email: string): string | null => {
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'live.com'
  ];
  
  const domain = extractDomain(email);
  const username = email.split('@')[0];
  
  if (!domain || !username) return null;
  
  // Check for common typos
  const suggestions: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };
  
  if (suggestions[domain]) {
    return `${username}@${suggestions[domain]}`;
  }
  
  return null;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

export const generateValidationId = (): string => {
  return `validation-${Math.random().toString(36).substr(2, 9)}`;
};