import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_value: string;
  discount_type: 'percentage' | 'fixed' | 'bogo';
  terms: string;
  expires_at: string;
  is_active: boolean;
  views: number;
  prints: number;
  created_at: string;
  businesses?: {
    name: string;
    category: string;
  };
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  description: string;
  logo_url?: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  subscription_plan: 'basic' | 'pro' | 'enterprise';
  referral_code: string;
  referred_by?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  referral_code: string;
  referred_by?: string;
  created_at: string;
}

export interface SponsoredOffer {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  offer_type: 'banner' | 'coupon';
  banner_image_url?: string;
  banner_link_url?: string;
  discount_value?: string;
  discount_type?: string;
  terms?: string;
  expires_at?: string;
  is_active: boolean;
  views: number;
  clicks: number;
  created_at: string;
  businesses?: {
    name: string;
  };
}