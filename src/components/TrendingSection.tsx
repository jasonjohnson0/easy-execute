import { Badge } from '@/components/ui/badge';
import { DealCard } from '@/components/DealCard';
import { useTrending } from '@/hooks/useTrending';
import { Deal } from '@/types/database';
import { TrendingUp, Flame } from 'lucide-react';

interface TrendingSectionProps {
  deals: Deal[];
}

export function TrendingSection({ deals }: TrendingSectionProps) {
  const { getTrendingDeals, getAllTrendingDeals } = useTrending(deals);
  const trendingDeals = getTrendingDeals(6);
  const allTrending = getAllTrendingDeals();

  if (trendingDeals.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Now
          <Badge variant="secondary" className="ml-2">
            <Flame className="w-3 h-3 mr-1" />
            {allTrending.length} Hot Deal{allTrending.length === 1 ? '' : 's'}
          </Badge>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingDeals.map((deal) => (
          <div key={`trending-${deal.id}`} className="relative">
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground"
            >
              <Flame className="w-3 h-3 mr-1" />
              Trending
            </Badge>
            <DealCard
              deal={deal}
              layout="grid"
            />
          </div>
        ))}
      </div>
    </div>
  );
}