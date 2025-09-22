import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionStatus {
  subscribed: boolean;
  membership_id?: string;
  expires_at?: string;
  organization_id?: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check subscription status
  const { data: subscription, isLoading: isCheckingSubscription, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Create subscription checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async ({ applyFirstTimeDiscount = false }: { applyFirstTimeDiscount?: boolean } = {}) => {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { applyFirstTimeDiscount }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
      }
    },
    onError: (error: any) => {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  // Create customer portal session
  const createPortalMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Open portal in new tab
        window.open(data.url, '_blank');
      }
    },
    onError: (error: any) => {
      console.error('Portal error:', error);
      toast({
        title: "Portal Error",
        description: error.message || "Failed to create customer portal session",
        variant: "destructive",
      });
    },
  });

  // Auto-refresh subscription status after successful checkout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription-success') {
        localStorage.removeItem('subscription-success');
        setTimeout(() => {
          refetchSubscription();
          queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        }, 2000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetchSubscription, queryClient]);

  const isSubscribed = subscription?.subscribed || false;
  const isExpired = subscription?.expires_at ? new Date(subscription.expires_at) < new Date() : false;
  const hasValidSubscription = isSubscribed && !isExpired;

  return {
    subscription,
    isSubscribed: hasValidSubscription,
    isCheckingSubscription,
    isExpired,
    createCheckout: createCheckoutMutation.mutate,
    isCreatingCheckout: createCheckoutMutation.isPending,
    openCustomerPortal: createPortalMutation.mutate,
    isOpeningPortal: createPortalMutation.isPending,
    refetchSubscription,
  };
}