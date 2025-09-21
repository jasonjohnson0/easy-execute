import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Favorite {
  id: string;
  user_id: string;
  deal_id: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load your saved deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if a deal is favorited
  const isFavorited = (dealId: string) => {
    return favorites.some(fav => fav.deal_id === dealId);
  };

  // Toggle favorite status
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

    try {
      if (isCurrentlyFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('deal_id', dealId);

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => fav.deal_id !== dealId));
        toast({
          title: "Removed from favorites",
          description: "Deal removed from your saved list",
        });
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            deal_id: dealId,
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [...prev, data]);
        toast({
          title: "Added to favorites",
          description: "Deal saved to your favorites list",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Get favorited deal IDs
  const getFavoritedDealIds = () => {
    return favorites.map(fav => fav.deal_id);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    isFavorited,
    toggleFavorite,
    getFavoritedDealIds,
    refetchFavorites: fetchFavorites,
  };
}