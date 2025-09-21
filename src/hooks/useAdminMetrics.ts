import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminMetrics {
  total_users: number;
  total_businesses: number;
  total_deals: number;
  active_deals: number;
  inactive_deals: number;
  total_qr_scans: number;
  total_share_clicks: number;
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async (): Promise<AdminMetrics> => {
      const { data, error } = await supabase.rpc('get_admin_metrics');
      
      if (error) throw error;
      return data ? JSON.parse(JSON.stringify(data)) : {
        total_users: 0,
        total_businesses: 0,
        total_deals: 0,
        active_deals: 0,
        inactive_deals: 0,
        total_qr_scans: 0,
        total_share_clicks: 0
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useQRAnalytics(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['qr-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<Array<{ date: string; scans: number }>> => {
      const { data, error } = await supabase.rpc('get_qr_scan_analytics', {
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString()
      });
      
      if (error) throw error;
      
      // Handle the JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      if (Array.isArray(data)) {
        return data as Array<{ date: string; scans: number }>;
      }
      return [];
    },
    enabled: true,
  });
}