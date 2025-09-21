import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DealCard } from '@/components/DealCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '@/components/AuthModal';

export default function Favorites() {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading, refetchFavorites } = useFavorites();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // Fetch deal details for favorited deals
  const fetchFavoriteDeals = async () => {
    if (!user || favorites.length === 0) {
      setDeals([]);
      return;
    }

    setLoading(true);
    try {
      const dealIds = favorites.map(fav => fav.deal_id);
      
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          businesses(name, category)
        `)
        .in('id', dealIds)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals((data as any) || []);
    } catch (error) {
      console.error('Error fetching favorite deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    fetchFavoriteDeals();
  }, [user, favorites]);

  // Show auth modal if not signed in
  if (!user) {
    return (
      <>
        <Header categories={[]} />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-3xl font-bold mb-4">Your Favorite Deals</h1>
                <p className="text-muted-foreground mb-6">
                  Sign in to save your favorite deals and access them anytime.
                </p>
                <Button onClick={() => setShowAuthModal(true)} size="lg">
                  Sign In to View Favorites
                </Button>
              </div>
            </div>
          </div>
        </div>
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          mode="signin"
          userType="hunter"
          onModeChange={() => {}}
          onUserTypeChange={() => {}}
        />
      </>
    );
  }

  return (
    <>
      <Header categories={[]} />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                Your Favorite Deals
              </h1>
              <p className="text-muted-foreground mt-1">
                {loading || favoritesLoading ? 'Loading...' : `${deals.length} saved deals`}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {(loading || favoritesLoading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Favorites State */}
          {!loading && !favoritesLoading && deals.length === 0 && (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-semibold mb-2">No favorite deals yet</h2>
              <p className="text-muted-foreground mb-6">
                Start browsing deals and click the heart icon to save your favorites!
              </p>
              <Button onClick={() => navigate('/')} size="lg">
                Browse Deals
              </Button>
            </div>
          )}

          {/* Deals Grid */}
          {!loading && !favoritesLoading && deals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  layout="grid"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}