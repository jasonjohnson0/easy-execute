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

      const { data, error } = await (supabase as any)
        .from('deals')
        .select(`
          *,
          businesses (
            name,
            category
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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