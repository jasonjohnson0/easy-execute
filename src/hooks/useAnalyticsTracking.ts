import { supabase } from '@/integrations/supabase/client';

export function useAnalyticsTracking() {
  const trackQRScan = async (dealId: string, businessId: string) => {
    try {
      await supabase.from('qr_scans').insert({
        deal_id: dealId,
        business_id: businessId,
        user_agent: navigator.userAgent,
        location: null, // Could be enhanced with geolocation
      });
    } catch (error) {
      console.warn('Failed to track QR scan:', error);
    }
  };

  const trackShareClick = async (
    dealId: string, 
    businessId: string, 
    platform: string
  ) => {
    try {
      await supabase.from('share_clicks').insert({
        deal_id: dealId,
        business_id: businessId,
        platform,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.warn('Failed to track share click:', error);
    }
  };

  return {
    trackQRScan,
    trackShareClick,
  };
}