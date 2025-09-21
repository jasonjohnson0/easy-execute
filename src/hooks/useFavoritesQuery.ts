import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Favorite } from '@/hooks/useFavorites';

export function useFavoritesQuery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (dealId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          deal_id: dealId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (dealId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites', user?.id]);

      // Optimistically update
      if (previousFavorites && user) {
        const optimisticFavorite: Favorite = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          deal_id: dealId,
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData(['favorites', user.id], [...previousFavorites, optimisticFavorite]);
      }

      return { previousFavorites };
    },
    onError: (error, dealId, context) => {
      // Rollback on error
      if (context?.previousFavorites && user) {
        queryClient.setQueryData(['favorites', user.id], context.previousFavorites);
      }
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to favorites",
        description: "Deal saved to your favorites list",
      });
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (dealId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('deal_id', dealId);

      if (error) throw error;
    },
    onMutate: async (dealId: string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });

      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites', user?.id]);

      // Optimistically update
      if (previousFavorites && user) {
        const updatedFavorites = previousFavorites.filter(fav => fav.deal_id !== dealId);
        queryClient.setQueryData(['favorites', user.id], updatedFavorites);
      }

      return { previousFavorites };
    },
    onError: (error, dealId, context) => {
      if (context?.previousFavorites && user) {
        queryClient.setQueryData(['favorites', user.id], context.previousFavorites);
      }
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "Deal removed from your saved list",
      });
    },
  });

  const isFavorited = (dealId: string) => {
    const favorites = favoritesQuery.data || [];
    return favorites.some(fav => fav.deal_id === dealId);
  };

  const toggleFavorite = async (dealId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your favorite deals",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyFavorited = isFavorited(dealId);

    if (isCurrentlyFavorited) {
      removeFavoriteMutation.mutate(dealId);
    } else {
      addFavoriteMutation.mutate(dealId);
    }
  };

  const getFavoritedDealIds = () => {
    const favorites = favoritesQuery.data || [];
    return favorites.map(fav => fav.deal_id);
  };

  return {
    favorites: favoritesQuery.data || [],
    loading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    isFavorited,
    toggleFavorite,
    getFavoritedDealIds,
    refetchFavorites: favoritesQuery.refetch,
    isToggling: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
}