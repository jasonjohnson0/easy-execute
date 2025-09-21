import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserHasDeals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-has-deals', user?.businessProfile?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.businessProfile?.id) {
        return false;
      }

      const { data, error } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', user.businessProfile.id)
        .limit(1);

      if (error) {
        console.error('Error checking user deals:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    },
    enabled: !!user?.businessProfile?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });
}