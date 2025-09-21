import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export function useBusinessHours(businessId?: string) {
  return useQuery({
    queryKey: ['business-hours', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (hours: Omit<BusinessHours, 'id'>[]) => {
      const { error } = await supabase
        .from('business_hours')
        .upsert(hours, { 
          onConflict: 'business_id,day_of_week',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-hours', variables[0]?.business_id] 
      });
      toast({
        title: "Success",
        description: "Business hours updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business hours",
        variant: "destructive",
      });
      console.error('Error updating business hours:', error);
    },
  });
}