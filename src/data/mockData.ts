import type { Deal, SponsoredOffer } from '@/types/database';

export const USE_MOCK_DEALS = true; // Toggle for development

export const DEAL_CATEGORIES = [
  'All Categories',
  'Food & Dining',
  'Coffee Shops',
  'Home Services',
  'Retail & Shopping',
  'Health & Beauty',
  'Entertainment',
  'Automotive',
  'Professional Services'
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    business_id: 'b1',
    title: '20% Off All Coffee Drinks',
    description: 'Get 20% off any coffee drink during happy hour (2-5 PM). Valid for hot and cold beverages.',
    discount_value: '20',
    discount_type: 'percentage',
    terms: 'Valid Monday-Friday 2-5 PM. Cannot be combined with other offers.',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 1247,
    prints: 89,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Brew & Bean Cafe',
      category: 'Coffee Shops'
    }
  },
  {
    id: '2',
    business_id: 'b2',
    title: 'Buy One Get One Free Pizza',
    description: 'Order any large pizza and get a second large pizza absolutely free. Perfect for sharing!',
    discount_value: 'Buy One Get One Free',
    discount_type: 'bogo',
    terms: 'Valid on large pizzas only. Dine-in or takeout. Free pizza must be of equal or lesser value.',
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 2156,
    prints: 143,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Mario\'s Pizza Palace',
      category: 'Food & Dining'
    }
  },
  {
    id: '3',
    business_id: 'b3',
    title: '$15 Off House Cleaning',
    description: 'Professional house cleaning service with $15 discount on your first booking.',
    discount_value: '15',
    discount_type: 'fixed',
    terms: 'New customers only. Minimum 3-hour service required. Must mention coupon when booking.',
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 892,
    prints: 67,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Sparkle Clean Services',
      category: 'Home Services'
    }
  },
  {
    id: '4',
    business_id: 'b4',
    title: '30% Off All Skincare Products',
    description: 'Huge savings on premium skincare products. Refresh your routine with quality products.',
    discount_value: '30',
    discount_type: 'percentage',
    terms: 'Excludes sale items. Valid on in-stock products only.',
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 1634,
    prints: 134,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Glow Beauty Studio',
      category: 'Health & Beauty'
    }
  },
  {
    id: '5',
    business_id: 'b5',
    title: 'Free Oil Change with Tire Rotation',
    description: 'Get a complimentary oil change when you book a tire rotation service.',
    discount_value: 'Free Oil Change',
    discount_type: 'bogo',
    terms: 'Must book tire rotation first. Standard oil only. Synthetic oil upgrade available.',
    expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 756,
    prints: 45,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Quick Fix Auto',
      category: 'Automotive'
    }
  }
];

export const mockSponsoredOffers: SponsoredOffer[] = [
  {
    id: 's1',
    business_id: 'b6',
    title: 'Grand Opening Special - 50% Off Everything!',
    description: 'Celebrate our grand opening with massive savings on all items',
    offer_type: 'coupon',
    discount_value: '50',
    discount_type: 'percentage',
    terms: 'Valid for grand opening week only. Some exclusions may apply.',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    views: 3421,
    clicks: 267,
    created_at: new Date().toISOString(),
    businesses: {
      name: 'Trendy Threads Boutique'
    }
  }
];