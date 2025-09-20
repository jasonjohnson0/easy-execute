import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, List, Filter, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { DealCard } from '@/components/DealCard';
import { useAuth } from '@/hooks/useAuth';
import { mockDeals, mockSponsoredOffers, DEAL_CATEGORIES, USE_MOCK_DEALS } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import type { Deal, SponsoredOffer } from '@/lib/supabase';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sponsoredOffers, setSponsoredOffers] = useState<SponsoredOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [layout, setLayout] = useState<'grid' | 'coupon'>('grid');

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      
      if (USE_MOCK_DEALS) {
        // Use mock data for development
        setDeals(mockDeals);
        setSponsoredOffers(mockSponsoredOffers);
      } else {
        try {
          // Fetch real deals from Supabase
          const { data: dealsData } = await supabase
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

          const { data: sponsoredData } = await supabase
            .from('sponsored_offers')
            .select(`
              *,
              businesses (
                name
              )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          setDeals(dealsData || []);
          setSponsoredOffers(sponsoredData || []);
        } catch (error) {
          console.error('Error fetching deals:', error);
          // Fallback to mock data on error
          setDeals(mockDeals);
          setSponsoredOffers(mockSponsoredOffers);
        }
      }
      
      setLoading(false);
    };

    fetchDeals();
  }, []);

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
                  {!user && (
                    <>
                      <Button variant="hero" size="lg" className="text-lg px-8">
                        Start Discovering Deals
                      </Button>
                      <Button variant="outline" size="lg" className="text-lg px-8">
                        Join as Business
                      </Button>
                    </>
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
                  <div>
                    <div className="font-semibold text-2xl text-foreground">$10K+</div>
                    <div>Total Savings</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src={heroImage}
                  alt="Local businesses and community shopping"
                  className="rounded-2xl shadow-2xl w-full max-w-lg ml-auto"
                />
                <div className="absolute -bottom-4 -left-4 bg-secondary text-secondary-foreground p-4 rounded-lg shadow-lg">
                  <div className="font-bold text-lg">20% OFF</div>
                  <div className="text-sm">Your first deal!</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals Section */}
      <section className="py-8">
        <div className="container px-4">
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
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
