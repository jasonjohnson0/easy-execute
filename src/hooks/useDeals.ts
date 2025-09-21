import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockDeals, USE_MOCK_DEALS } from '@/data/mockData';
import type { Deal } from '@/types/database';

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async (): Promise<Deal[]> => {
      if (USE_MOCK_DEALS) {
        // Simulate network delay for development
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockDeals;
      }

      // Use secure RPC function instead of direct join to protect business data
      const { data, error } = await supabase
        .rpc('get_deals_with_safe_business_info');

      if (error) throw error;

      // Transform the data to match the expected Deal type with businesses object
      return (data || []).map(deal => ({
        id: deal.id,
        business_id: deal.business_id,
        title: deal.title,
        description: deal.description,
        discount_value: deal.discount_value,
        discount_type: deal.discount_type as 'percentage' | 'fixed' | 'bogo',
        terms: deal.terms,
        expires_at: deal.expires_at,
        is_active: deal.is_active,
        views: deal.views,
        prints: deal.prints,
        created_at: deal.created_at,
        businesses: {
          name: deal.business_name,
          category: deal.business_category
        }
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && (error as any)?.message?.includes('fetch')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}