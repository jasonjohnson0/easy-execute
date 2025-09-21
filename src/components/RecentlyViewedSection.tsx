import { Button } from '@/components/ui/button';
import { DealCard } from '@/components/DealCard';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock, X } from 'lucide-react';

export function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed, getRecentDeals } = useRecentlyViewed();
  const recentDeals = getRecentDeals(6);

  if (recentDeals.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Recently Viewed
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecentlyViewed}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear History
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentDeals.map((deal) => (
          <DealCard
            key={`recent-${deal.id}`}
            deal={deal}
            layout="grid"
          />
        ))}
      </div>
    </div>
  );
}