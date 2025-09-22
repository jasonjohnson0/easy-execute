import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Organization {
  id: string;
  name: string;
  keyword: string;
  contact_email: string;
  commission_rate: number;
  total_referrals: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
  recent_conversions?: number;
  recent_earnings?: number;
}

export interface ReferralAnalytics {
  organizations: Organization[];
  total_conversions: number;
  total_commission_paid: number;
  active_memberships: number;
}

export function useReferralAnalytics() {
  return useQuery({
    queryKey: ['referral-analytics'],
    queryFn: async (): Promise<ReferralAnalytics> => {
      const { data, error } = await supabase.rpc('get_referral_analytics');
      
      if (error) {
        console.error('Error fetching referral analytics:', error);
        throw error;
      }
      
      return (data as unknown as ReferralAnalytics) || { organizations: [], total_conversions: 0, total_commission_paid: 0, active_memberships: 0 };
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
      
      return data || [];
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orgData: {
      name: string;
      keyword: string;
      contact_email: string;
      commission_rate?: number;
    }) => {
      // Validate keyword format (lowercase, alphanumeric + numbers)
      const keywordRegex = /^[a-z0-9]+$/;
      if (!keywordRegex.test(orgData.keyword)) {
        throw new Error('Keyword must be lowercase letters and numbers only');
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          ...orgData,
          commission_rate: orgData.commission_rate || 0.25,
        }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('This keyword is already taken. Please choose a different one.');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['referral-analytics'] });
      toast.success('Organization created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create organization');
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Organization>;
    }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['referral-analytics'] });
      toast.success('Organization updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update organization');
    },
  });
}

export function useOrganizationByKeyword(keyword: string | null) {
  return useQuery({
    queryKey: ['organization', keyword],
    queryFn: async (): Promise<Organization | null> => {
      if (!keyword) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('keyword', keyword.toLowerCase())
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!keyword,
  });
}