import { useState, useEffect } from 'react';
import { Deal, SponsoredOffer } from '@/types/database';

const STORAGE_KEY = 'localdeals_recently_viewed';
const MAX_RECENT_DEALS = 20;

interface ViewedDeal {
  id: string;
  timestamp: number;
  deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } });
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<ViewedDeal[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ViewedDeal[];
        // Filter out deals older than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filtered = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        setRecentlyViewed(filtered);
      }
    } catch (error) {
      console.error('Error loading recently viewed deals:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const addRecentlyViewed = (deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } })) => {
    try {
      const newItem: ViewedDeal = {
        id: deal.id,
        timestamp: Date.now(),
        deal
      };

      setRecentlyViewed(prev => {
        // Remove existing entry with same ID
        const filtered = prev.filter(item => item.id !== deal.id);
        // Add new item to beginning
        const updated = [newItem, ...filtered].slice(0, MAX_RECENT_DEALS);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error saving recently viewed deal:', error);
    }
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getRecentDeals = (limit = 6) => {
    return recentlyViewed.slice(0, limit).map(item => item.deal);
  };

  return {
    recentlyViewed: recentlyViewed.map(item => item.deal),
    addRecentlyViewed,
    clearRecentlyViewed,
    getRecentDeals
  };
}