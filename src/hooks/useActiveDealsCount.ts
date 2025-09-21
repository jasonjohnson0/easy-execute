import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { USE_MOCK_DEALS } from '@/data/mockData';

export function useActiveDealsCount() {
  return useQuery({
    queryKey: ['active-deals-count'],
    queryFn: async (): Promise<number> => {
      if (USE_MOCK_DEALS) {
        // Return mock count for development
        await new Promise(resolve => setTimeout(resolve, 200));
        return 12;
      }

      const { data, error } = await supabase.rpc('get_active_deals_count');

      if (error) throw error;
      return data ?? 0;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (deals count rarely changes)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 1,
  });
}