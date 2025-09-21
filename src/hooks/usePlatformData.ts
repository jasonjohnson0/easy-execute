import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  role: string;
  user_profile: string | null;
  business_profile: {
    business_name: string;
    category: string;
    subscription_status: string;
    subscription_plan: string;
  } | null;
}

interface PlatformBusiness {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  category: string;
  description: string | null;
  subscription_status: string;
  subscription_plan: string;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  deal_count: number;
  active_deal_count: number;
}

interface PlatformDeal {
  id: string;
  title: string;
  description: string;
  discount_value: string;
  discount_type: string;
  terms: string;
  expires_at: string;
  is_active: boolean;
  views: number;
  prints: number;
  created_at: string;
  business_name: string;
  business_category: string;
}

interface PlatformAnalytics {
  user_signups_by_day: Array<{ date: string; signups: number }>;
  business_signups_by_day: Array<{ date: string; signups: number }>;
  deals_created_by_day: Array<{ date: string; deals: number }>;
  qr_scans_by_day: Array<{ date: string; scans: number }>;
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async (): Promise<PlatformUser[]> => {
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      return (data as unknown as PlatformUser[]) || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePlatformBusinesses() {
  return useQuery({
    queryKey: ['platform-businesses'],
    queryFn: async (): Promise<PlatformBusiness[]> => {
      const { data, error } = await supabase.rpc('get_all_businesses');
      
      if (error) throw error;
      return (data as unknown as PlatformBusiness[]) || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePlatformDeals() {
  return useQuery({
    queryKey: ['platform-deals'],
    queryFn: async (): Promise<PlatformDeal[]> => {
      const { data, error } = await supabase.rpc('get_all_deals');
      
      if (error) throw error;
      return (data as unknown as PlatformDeal[]) || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePlatformAnalytics(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['platform-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<PlatformAnalytics> => {
      const { data, error } = await supabase.rpc('get_platform_analytics', {
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString()
      });
      
      if (error) throw error;
      
      return (data as unknown as PlatformAnalytics) || {
        user_signups_by_day: [],
        business_signups_by_day: [],
        deals_created_by_day: [],
        qr_scans_by_day: []
      };
    },
    enabled: true,
  });
}

export function useAdminManagement() {
  const addAdmin = async (email: string) => {
    const { error } = await supabase.rpc('add_admin_role', {
      target_email: email
    });
    
    if (error) throw error;
    return true;
  };

  const removeAdmin = async (email: string) => {
    const { error } = await supabase.rpc('remove_admin_role', {
      target_email: email
    });
    
    if (error) throw error;
    return true;
  };

  return {
    addAdmin,
    removeAdmin,
  };
}