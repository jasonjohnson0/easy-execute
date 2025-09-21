import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeHTML } from './sanitization';

/**
 * Safe business data interface for public consumption
 */
export interface SafeBusinessData {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  created_at: string;
}

/**
 * Full business data interface for owners
 */
export interface FullBusinessData extends SafeBusinessData {
  email: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  subscription_status: string;
  subscription_plan: string;
  referral_code: string;
  referred_by?: string;
}

/**
 * Fetch safe business data for public consumption
 */
export const fetchPublicBusinessData = async (): Promise<SafeBusinessData[]> => {
  const { data, error } = await supabase
    .from('businesses_public')
    .select('*');

  if (error) {
    console.error('Error fetching public business data:', error);
    throw error;
  }

  // Sanitize all text fields
  return (data || []).map(business => ({
    ...business,
    name: sanitizeInput(business.name || ''),
    category: sanitizeInput(business.category || ''),
    description: sanitizeHTML(business.description || ''),
  }));
};

/**
 * Fetch full business data for authenticated business owner
 */
export const fetchOwnerBusinessData = async (businessId?: string): Promise<FullBusinessData | null> => {
  const query = supabase.from('businesses').select('*');
  
  if (businessId) {
    query.eq('id', businessId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching owner business data:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Sanitize text fields
  return {
    ...data,
    name: sanitizeInput(data.name || ''),
    category: sanitizeInput(data.category || ''),
    description: sanitizeHTML(data.description || ''),
  } as FullBusinessData;
};

/**
 * Update business data with security validation
 */
export const updateBusinessData = async (
  businessId: string, 
  updates: Partial<FullBusinessData>
): Promise<void> => {
  // Sanitize all input data
  const sanitizedUpdates: any = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    if (typeof value === 'string') {
      switch (key) {
        case 'description':
          sanitizedUpdates[key] = sanitizeHTML(value);
          break;
        case 'email':
          // Keep original email validation in the component
          sanitizedUpdates[key] = value;
          break;
        default:
          sanitizedUpdates[key] = sanitizeInput(value);
      }
    } else {
      sanitizedUpdates[key] = value;
    }
  });

  const { error } = await supabase
    .from('businesses')
    .update(sanitizedUpdates)
    .eq('id', businessId);

  if (error) {
    console.error('Error updating business data:', error);
    throw error;
  }
};

/**
 * Log audit event for business data access
 */
export const logBusinessAccess = async (
  businessId: string,
  accessType: string
): Promise<void> => {
  try {
    await supabase
      .from('business_audit_log')
      .insert({
        business_id: businessId,
        access_type: accessType,
        ip_address: null, // Would need server-side implementation
        user_agent: navigator.userAgent,
      });
  } catch (error) {
    // Don't throw on audit log errors to avoid breaking main functionality
    console.warn('Failed to log business access:', error);
  }
};
