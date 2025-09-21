import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockSponsoredOffers, USE_MOCK_DEALS } from '@/data/mockData';
import type { SponsoredOffer } from '@/types/database';

export function useSponsoredOffers() {
  return useQuery({
    queryKey: ['sponsored-offers'],
    queryFn: async (): Promise<SponsoredOffer[]> => {
      if (USE_MOCK_DEALS) {
        // Simulate network delay for development
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockSponsoredOffers;
      }

      const { data, error } = await (supabase as any)
        .from('sponsored_offers')
        .select(`
          *,
          businesses (
            name
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
}