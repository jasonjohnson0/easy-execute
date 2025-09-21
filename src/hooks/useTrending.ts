import { useMemo } from 'react';
import { Deal, SponsoredOffer } from '@/types/database';

interface TrendingDeal extends Deal {
  trendingScore: number;
  isTrending: boolean;
}

export function useTrending(deals: Deal[]) {
  const trendingDeals = useMemo(() => {
    if (!deals.length) return [];

    // Calculate trending scores
    const scoredDeals: TrendingDeal[] = deals.map(deal => {
      const createdAt = new Date(deal.created_at);
      const daysSinceCreated = Math.max(1, (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
      
      // Trending formula: (views * 0.7 + prints * 1.5) / days_since_created
      // Prints are weighted higher as they show real engagement
      const rawScore = ((deal.views || 0) * 0.7 + (deal.prints || 0) * 1.5) / daysSinceCreated;
      
      // Add bonus for recent deals (less than 7 days old)
      const recencyBonus = daysSinceCreated <= 7 ? 1.3 : 1.0;
      
      const trendingScore = rawScore * recencyBonus;
      
      return {
        ...deal,
        trendingScore,
        isTrending: false // Will be set based on percentile
      };
    });

    // Sort by trending score
    scoredDeals.sort((a, b) => b.trendingScore - a.trendingScore);

    // Mark top 20% as trending (minimum 1, maximum 10)
    const trendingCount = Math.max(1, Math.min(10, Math.ceil(deals.length * 0.2)));
    
    for (let i = 0; i < trendingCount && i < scoredDeals.length; i++) {
      // Only mark as trending if it has meaningful engagement
      if (scoredDeals[i].trendingScore > 0.5) {
        scoredDeals[i].isTrending = true;
      }
    }

    return scoredDeals;
  }, [deals]);

  const getTrendingDeals = (limit = 6) => {
    return trendingDeals
      .filter(deal => deal.isTrending)
      .slice(0, limit);
  };

  const getAllTrendingDeals = () => {
    return trendingDeals.filter(deal => deal.isTrending);
  };

  const isTrendingDeal = (dealId: string) => {
    return trendingDeals.find(deal => deal.id === dealId)?.isTrending || false;
  };

  const getTrendingScore = (dealId: string) => {
    return trendingDeals.find(deal => deal.id === dealId)?.trendingScore || 0;
  };

  return {
    trendingDeals,
    getTrendingDeals,
    getAllTrendingDeals,
    isTrendingDeal,
    getTrendingScore
  };
}