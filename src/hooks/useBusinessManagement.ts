import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BusinessProfileData } from '@/lib/validations/schemas';

export function useBusinessManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBusiness = useMutation({
    mutationFn: async ({ businessId, data }: { businessId: string; data: Partial<BusinessProfileData> }) => {
      const { error } = await supabase
        .from('businesses')
        .update(data)
        .eq('id', businessId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      toast({
        title: 'Success',
        description: 'Business updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update business',
        variant: 'destructive',
      });
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ 
      businessId, 
      subscriptionStatus, 
      subscriptionPlan 
    }: { 
      businessId: string; 
      subscriptionStatus: string; 
      subscriptionPlan: string; 
    }) => {
      const { error } = await supabase
        .from('businesses')
        .update({
          subscription_status: subscriptionStatus,
          subscription_plan: subscriptionPlan,
        })
        .eq('id', businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      });
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      // First delete related deals
      await supabase
        .from('deals')
        .delete()
        .eq('business_id', businessId);

      // Then delete the business
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] });
      toast({
        title: 'Success',
        description: 'Business deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete business',
        variant: 'destructive',
      });
    },
  });

  return {
    updateBusiness,
    updateSubscription,
    deleteBusiness,
    isUpdating: updateBusiness.isPending || updateSubscription.isPending,
    isDeleting: deleteBusiness.isPending,
  };
}