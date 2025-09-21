import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, List, Filter, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { DealCard } from '@/components/DealCard';
import { AuthModal } from '@/components/AuthModal';
import { WelcomeModal } from '@/components/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';
import { mockDeals, mockSponsoredOffers, DEAL_CATEGORIES, USE_MOCK_DEALS } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import type { Deal, SponsoredOffer } from '@/types/database';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { user, showWelcomeModal, setShowWelcomeModal } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sponsoredOffers, setSponsoredOffers] = useState<SponsoredOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [layout, setLayout] = useState<'grid' | 'coupon'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authUserType, setAuthUserType] = useState<'hunter' | 'business'>('hunter');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      console.log('🔄 Fetching deals...', { 
        authenticated: !!user, 
        userId: user?.id, 
        mockMode: USE_MOCK_DEALS 
      });
      
      setLoading(true);
      setError(null);
      
      if (USE_MOCK_DEALS) {
        console.log('📊 Using mock data for development');
        setDeals(mockDeals);
        setSponsoredOffers(mockSponsoredOffers);
      } else {
        try {
          console.log('🌐 Fetching real deals from Supabase...');
          
          // Fetch real deals from Supabase
          const { data: dealsData, error: dealsError } = await (supabase as any)
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

          const { data: sponsoredData, error: sponsoredError } = await (supabase as any)
            .from('sponsored_offers')
            .select(`
              *,
              businesses (
                name
              )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (dealsError) {
            console.error('❌ Error fetching deals:', dealsError);
            throw dealsError;
          }
          
          if (sponsoredError) {
            console.error('❌ Error fetching sponsored offers:', sponsoredError);
            throw sponsoredError;
          }

          const deals = (dealsData || []) as Deal[];
          const sponsored = (sponsoredData || []) as SponsoredOffer[];
          
          console.log('✅ Successfully fetched data:', { 
            dealsCount: deals.length, 
            sponsoredCount: sponsored.length,
            deals: deals.map(d => ({ id: d.id, title: d.title, active: d.is_active })),
            sponsored: sponsored.map(s => ({ id: s.id, title: s.title, active: s.is_active }))
          });

          setDeals(deals);
          setSponsoredOffers(sponsored);
        } catch (error) {
          console.error('💥 Error fetching deals:', error);
          setError('Failed to load deals. Please try refreshing the page.');
          // Fallback to mock data on error for development
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Falling back to mock data...');
            setDeals(mockDeals);
            setSponsoredOffers(mockSponsoredOffers);
          }
        }
      }
      
      setLoading(false);
    };

    fetchDeals();
  }, [user]); // Re-fetch when user authentication changes

  // Filter deals based on search and category
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.businesses?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All Categories' || 
      deal.businesses?.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Debug filtering results
  console.log('🔍 Filtering results:', {
    totalDeals: deals.length,
    filteredDeals: filteredDeals.length,
    searchQuery,
    selectedCategory,
    user: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={DEAL_CATEGORIES}
        />
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={DEAL_CATEGORIES}
      />

      {/* Hero Section */}
      {!searchQuery && selectedCategory === 'All Categories' && (
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    New deals every day
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                    Discover Amazing{' '}
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      Local Deals
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md">
                    Connect with local businesses and save money with exclusive deals in your area. 
                    Print coupons instantly and start saving today!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => {
                      if (user) {
                        // Scroll to deals section for authenticated users
                        document.querySelector('#deals-section')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setShowAuthModal(true);
                      }
                    }}
                  >
                    {user ? 'View Latest Deals' : 'Subscribe to Discover Deals'}
                  </Button>
                  {!user && (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthUserType('business');
                        setShowAuthModal(true);
                      }}
                    >
                      Join as Business
                    </Button>
                  )}
                </div>

                <div className="flex gap-8 text-sm text-muted-foreground">
                  <div>
                    <div className="font-semibold text-2xl text-foreground">{deals.length}+</div>
                    <div>Active Deals</div>
                  </div>
                  <div>
                    <div className="font-semibold text-2xl text-foreground">500+</div>
                    <div>Local Businesses</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src={heroImage}
                  alt="Local businesses and community shopping"
                  className="rounded-2xl shadow-2xl w-full max-w-lg ml-auto"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals Section */}
      <section id="deals-section" className="py-8">
        <div className="container px-4">
          
          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive font-medium">⚠️ {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {searchQuery || selectedCategory !== 'All Categories' 
                  ? `Found ${filteredDeals.length} deals` 
                  : 'Latest Deals'}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery && `Search results for "${searchQuery}"`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ToggleGroup
                type="single"
                value={layout}
                onValueChange={(value) => value && setLayout(value as 'grid' | 'coupon')}
                className="border rounded-lg p-1"
              >
                <ToggleGroupItem value="grid" size="sm">
                  <Grid3X3 className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="coupon" size="sm">
                  <List className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Sponsored Offers */}
          {sponsoredOffers.length > 0 && !searchQuery && selectedCategory === 'All Categories' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge variant="secondary">Sponsored</Badge>
                Featured Offers
              </h3>
              <div className={`grid gap-6 ${
                layout === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                {sponsoredOffers.map((offer) => (
                  <DealCard
                    key={offer.id}
                    deal={offer}
                    layout={layout}
                    isSponsored={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Deals */}
          {filteredDeals.length > 0 ? (
            <div className={`grid gap-6 ${
              layout === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {filteredDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  layout={layout}
                />
              ))}
            </div>
          ) : filteredDeals.length === 0 && (searchQuery || selectedCategory !== 'All Categories') ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deals found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or browse all categories
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Auth Modal for subscription */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        userType={authUserType}
        onModeChange={setAuthMode}
        onUserTypeChange={setAuthUserType}
      />

      {/* Welcome Modal for new business users */}
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        businessName={user?.businessProfile?.name}
      />
    </div>
  );
};

export default Index;
