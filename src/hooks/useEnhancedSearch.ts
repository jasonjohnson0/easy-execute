import { useState, useMemo } from 'react';
import { Deal } from '@/types/database';
import { SearchFilters } from '@/components/EnhancedSearch';
import { isAfter, isBefore, parseISO } from 'date-fns';

export function useEnhancedSearch(deals: Deal[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All Categories',
    location: '',
    discountMin: 0,
    discountMax: 100,
    expiresBy: null,
    sortBy: 'recent'
  });

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      // Text search (query)
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        const matchesTitle = deal.title.toLowerCase().includes(searchTerm);
        const matchesDescription = deal.description.toLowerCase().includes(searchTerm);
        const matchesBusiness = (deal.businesses?.name || '').toLowerCase().includes(searchTerm);
        const matchesAddress = (deal.businesses as any)?.address?.toLowerCase().includes(searchTerm) || false;
        
        if (!matchesTitle && !matchesDescription && !matchesBusiness && !matchesAddress) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'All Categories') {
        if (deal.businesses?.category !== filters.category) {
          return false;
        }
      }

      // Location filter (basic implementation - would be enhanced with geolocation)
      if (filters.location) {
        const locationTerm = filters.location.toLowerCase();
        const businessAddress = (deal.businesses as any)?.address?.toLowerCase() || '';
        const businessName = (deal.businesses?.name || '').toLowerCase();
        
        if (!businessAddress.includes(locationTerm) && !businessName.includes(locationTerm)) {
          return false;
        }
      }

      // Discount range filter
      if (filters.discountMin > 0 || filters.discountMax < 100) {
        const discountValue = parseFloat(deal.discount_value) || 0;
        if (deal.discount_type === 'percentage') {
          if (discountValue < filters.discountMin || discountValue > filters.discountMax) {
            return false;
          }
        }
        // For fixed amounts and BOGO, we'll assume they're in the range for now
        // In a real app, you'd have more sophisticated discount comparison logic
      }

      // Expiration date filter
      if (filters.expiresBy) {
        const dealExpiry = parseISO(deal.expires_at);
        if (isAfter(dealExpiry, filters.expiresBy)) {
          return false;
        }
      }

      return true;
    });

    // Sort deals
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'expiring':
          return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
        
        case 'discount':
          const aDiscount = parseFloat(a.discount_value) || 0;
          const bDiscount = parseFloat(b.discount_value) || 0;
          
          // For percentage discounts, sort by percentage
          if (a.discount_type === 'percentage' && b.discount_type === 'percentage') {
            return bDiscount - aDiscount;
          }
          
          // BOGO and other special offers get priority
          if (a.discount_type === 'bogo' && b.discount_type !== 'bogo') return -1;
          if (b.discount_type === 'bogo' && a.discount_type !== 'bogo') return 1;
          
          return bDiscount - aDiscount;
        
        case 'distance':
          // In a real app, this would calculate actual distance based on user location
          // For now, just sort alphabetically by business name as a placeholder
          const aName = a.businesses?.name || '';
          const bName = b.businesses?.name || '';
          return aName.localeCompare(bName);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [deals, filters]);

  const searchStats = useMemo(() => {
    const total = deals.length;
    const filtered = filteredAndSortedDeals.length;
    const activeFilters = [
      filters.query,
      filters.category !== 'All Categories' ? filters.category : null,
      filters.location,
      filters.discountMin > 0 || filters.discountMax < 100 ? 'discount' : null,
      filters.expiresBy,
    ].filter(Boolean).length;

    return {
      total,
      filtered,
      activeFilters,
      hasFilters: activeFilters > 0
    };
  }, [deals.length, filteredAndSortedDeals.length, filters]);

  return {
    filters,
    setFilters,
    filteredDeals: filteredAndSortedDeals,
    searchStats
  };
}