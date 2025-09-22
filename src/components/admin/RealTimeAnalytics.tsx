import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAdminMetrics, useQRAnalytics } from '@/hooks/useAdminMetrics';
import { AnalyticsTestPanel } from '@/components/AnalyticsTestPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp, Users, Zap, Eye, Share2, QrCode, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LiveMetrics {
  total_qr_scans: number;
  total_share_clicks: number;
  total_deals: number;
  active_deals: number;
  total_users: number;
  total_businesses: number;
}

interface RealtimeEvent {
  id: string;
  type: 'qr_scan' | 'share_click' | 'deal_created' | 'user_signup' | 'business_signup';
  timestamp: string;
  details: string;
}

export function RealTimeAnalytics() {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const { data: historicalMetrics, refetch: refetchMetrics } = useAdminMetrics();
  const { data: qrAnalytics } = useQRAnalytics();

  // Initialize real-time subscriptions
  useEffect(() => {
    console.log('🔴 Setting up real-time analytics subscriptions...');

    // Load initial data
    loadInitialMetrics();

    // Set up real-time channels
    const qrChannel = supabase
      .channel('qr_scans_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'qr_scans'
        },
        (payload) => {
          console.log('📱 New QR scan detected:', payload);
          handleNewQRScan(payload);
        }
      )
      .subscribe((status) => {
        console.log('QR scans subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    const shareChannel = supabase
      .channel('share_clicks_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'share_clicks'
        },
        (payload) => {
          console.log('📤 New share click detected:', payload);
          handleNewShareClick(payload);
        }
      )
      .subscribe();

    const dealsChannel = supabase
      .channel('deals_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deals'
        },
        (payload) => {
          console.log('🎯 New deal created:', payload);
          handleNewDeal(payload);
        }
      )
      .subscribe();

    const businessesChannel = supabase
      .channel('businesses_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'businesses'
        },
        (payload) => {
          console.log('🏢 New business signup:', payload);
          handleNewBusiness(payload);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      console.log('🔴 Cleaning up real-time subscriptions...');
      supabase.removeChannel(qrChannel);
      supabase.removeChannel(shareChannel);
      supabase.removeChannel(dealsChannel);
      supabase.removeChannel(businessesChannel);
    };
  }, []);

  const loadInitialMetrics = async () => {
    try {
      console.log('📊 Loading initial analytics metrics...');
      
      const { data, error } = await supabase.rpc('get_admin_metrics');
      
      if (error) throw error;
      
      if (data && typeof data === 'object') {
        // Parse the JSON response and ensure it matches our interface
        const metrics = typeof data === 'string' ? JSON.parse(data) : data;
        setLiveMetrics({
          total_qr_scans: metrics.total_qr_scans || 0,
          total_share_clicks: metrics.total_share_clicks || 0,
          total_deals: metrics.total_deals || 0,
          active_deals: metrics.active_deals || 0,
          total_users: metrics.total_users || 0,
          total_businesses: metrics.total_businesses || 0,
        });
        setLastUpdate(new Date());
        console.log('✅ Initial metrics loaded:', metrics);
      }
    } catch (error) {
      console.error('❌ Error loading initial metrics:', error);
      toast({
        title: "Error loading metrics",
        description: "Unable to load real-time analytics data",
        variant: "destructive"
      });
    }
  };

  const handleNewQRScan = (payload: any) => {
    // Update live metrics
    if (liveMetrics) {
      setLiveMetrics(prev => prev ? {
        ...prev,
        total_qr_scans: prev.total_qr_scans + 1
      } : null);
    }

    // Add to recent events
    const newEvent: RealtimeEvent = {
      id: payload.new.id,
      type: 'qr_scan',
      timestamp: payload.new.scanned_at,
      details: `QR code scanned for deal ${payload.new.deal_id}`
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    setLastUpdate(new Date());
    
    // Show real-time notification
    toast({
      title: "📱 New QR Scan!",
      description: `Someone just scanned a QR code`,
    });
  };

  const handleNewShareClick = (payload: any) => {
    // Update live metrics
    if (liveMetrics) {
      setLiveMetrics(prev => prev ? {
        ...prev,
        total_share_clicks: prev.total_share_clicks + 1
      } : null);
    }

    // Add to recent events
    const newEvent: RealtimeEvent = {
      id: payload.new.id,
      type: 'share_click',
      timestamp: payload.new.clicked_at,
      details: `Deal shared via ${payload.new.platform}`
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    setLastUpdate(new Date());
    
    // Show real-time notification
    toast({
      title: "📤 New Share!",
      description: `Deal shared on ${payload.new.platform}`,
    });
  };

  const handleNewDeal = (payload: any) => {
    // Update live metrics
    if (liveMetrics) {
      setLiveMetrics(prev => prev ? {
        ...prev,
        total_deals: prev.total_deals + 1,
        active_deals: payload.new.is_active ? prev.active_deals + 1 : prev.active_deals
      } : null);
    }

    // Add to recent events
    const newEvent: RealtimeEvent = {
      id: payload.new.id,
      type: 'deal_created',
      timestamp: payload.new.created_at,
      details: `New deal: "${payload.new.title}"`
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    setLastUpdate(new Date());
    
    // Show real-time notification
    toast({
      title: "🎯 New Deal Created!",
      description: payload.new.title,
    });
  };

  const handleNewBusiness = (payload: any) => {
    // Update live metrics
    if (liveMetrics) {
      setLiveMetrics(prev => prev ? {
        ...prev,
        total_businesses: prev.total_businesses + 1
      } : null);
    }

    // Add to recent events
    const newEvent: RealtimeEvent = {
      id: payload.new.id,
      type: 'business_signup',
      timestamp: payload.new.created_at,
      details: `New business: "${payload.new.name}"`
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    setLastUpdate(new Date());
    
    // Show real-time notification
    toast({
      title: "🏢 New Business!",
      description: payload.new.name,
    });
  };

  const refreshData = async () => {
    await loadInitialMetrics();
    await refetchMetrics();
    toast({
      title: "Data refreshed",
      description: "Analytics data has been updated",
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'qr_scan': return <QrCode className="w-4 h-4 text-blue-500" />;
      case 'share_click': return <Share2 className="w-4 h-4 text-green-500" />;
      case 'deal_created': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'business_signup': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Real-time Connected' : 'Disconnected'}
            </span>
          </div>
          {lastUpdate && (
            <Badge variant="outline" className="text-xs">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList>
          <TabsTrigger value="live">Live Metrics</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="charts">Historical Charts</TabsTrigger>
          <TabsTrigger value="testing">Analytics Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* Live Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    QR Scans
                  </CardTitle>
                  <QrCode className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {liveMetrics?.total_qr_scans || historicalMetrics?.total_qr_scans || 0}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Total scans
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Share Clicks
                  </CardTitle>
                  <Share2 className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {liveMetrics?.total_share_clicks || historicalMetrics?.total_share_clicks || 0}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Total shares
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Active Deals
                  </CardTitle>
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {liveMetrics?.active_deals || historicalMetrics?.active_deals || 0}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  of {liveMetrics?.total_deals || historicalMetrics?.total_deals || 0} total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Total Engagement
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {((liveMetrics?.total_qr_scans || 0) + (liveMetrics?.total_share_clicks || 0)) || 
                   ((historicalMetrics?.total_qr_scans || 0) + (historicalMetrics?.total_share_clicks || 0)) || 0}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Combined interactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'QR Scans', value: liveMetrics?.total_qr_scans || historicalMetrics?.total_qr_scans || 0, fill: '#3b82f6' },
                    { name: 'Share Clicks', value: liveMetrics?.total_share_clicks || historicalMetrics?.total_share_clicks || 0, fill: '#10b981' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Real-time events will appear here</p>
                  </div>
                ) : (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-top-1 duration-300"
                    >
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Historical QR Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>QR Scan Analytics (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qrAnalytics || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Testing Panel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test analytics events and monitor real-time updates
              </p>
            </CardHeader>
            <CardContent>
              <AnalyticsTestPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}