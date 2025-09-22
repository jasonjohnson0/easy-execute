import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Printer, Share2, Heart, QrCode, Activity, Copy } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics/tracker';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { toast } from '@/hooks/use-toast';

export function AnalyticsTestPanel() {
  const analytics = useAnalytics();
  const { trackQRScan, trackShareClick } = useAnalyticsTracking();
  const [testEvents, setTestEvents] = useState<string[]>([]);

  const addTestEvent = (eventName: string) => {
    setTestEvents(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${eventName}`]);
  };

  const testAnalyticsEvent = (eventType: string) => {
    const testDealId = 'test-deal-123';
    const testBusinessId = 'test-business-456';
    const testDealTitle = 'Test Analytics Deal';

    switch (eventType) {
      case 'view':
        analytics.dealView(testDealId, testDealTitle, testBusinessId);
        addTestEvent('Deal View Tracked');
        break;
      case 'print':
        analytics.dealPrint(testDealId, testDealTitle, testBusinessId);
        addTestEvent('Deal Print Tracked');
        break;
      case 'share':
        analytics.dealShare(testDealId, testDealTitle, 'test');
        addTestEvent('Deal Share Tracked');
        break;
      case 'favorite':
        analytics.dealFavorite(testDealId, testDealTitle, 'add');
        addTestEvent('Deal Favorite Tracked');
        break;
      case 'qr_scan':
        trackQRScan(testDealId, testBusinessId);
        addTestEvent('QR Scan Tracked (DB)');
        break;
      case 'share_click':
        trackShareClick(testDealId, testBusinessId, 'twitter');
        addTestEvent('Share Click Tracked (DB)');
        break;
      case 'page_view':
        analytics.page('Test Page', { testParam: true });
        addTestEvent('Page View Tracked');
        break;
      case 'custom':
        analytics.track('test_custom_event', {
          customProperty: 'test_value',
          timestamp: Date.now()
        });
        addTestEvent('Custom Event Tracked');
        break;
    }

    toast({
      title: "Analytics Event Fired!",
      description: `${eventType} event has been tracked. Check console for details.`,
    });
  };

  const copySessionInfo = () => {
    const sessionInfo = analytics.getSessionAnalytics ? analytics.getSessionAnalytics() : {
      message: 'Session analytics not available'
    };
    
    navigator.clipboard.writeText(JSON.stringify(sessionInfo, null, 2))
      .then(() => {
        toast({
          title: "Session Info Copied",
          description: "Session analytics info copied to clipboard",
        });
      });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Analytics Test Panel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test analytics tracking events and monitor console logs
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analytics Event Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('view')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Test View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('print')}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            Test Print
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('share')}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Test Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('favorite')}
            className="gap-2"
          >
            <Heart className="w-4 h-4" />
            Test Favorite
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('qr_scan')}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            Test QR Scan
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('share_click')}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Test Share DB
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('page_view')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Test Page View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testAnalyticsEvent('custom')}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            Test Custom
          </Button>
        </div>

        {/* Session Info */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={copySessionInfo}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Session Info
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              analytics.flush && analytics.flush();
              toast({ title: "Analytics Flushed", description: "Forced analytics event flush" });
            }}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            Flush Events
          </Button>
        </div>

        {/* Recent Test Events */}
        {testEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Recent Test Events:</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {testEvents.map((event, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted p-3 rounded text-sm">
          <p className="font-medium mb-1">How to monitor analytics:</p>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Open browser console (F12)</li>
            <li>• Look for 🔍 Analytics Event logs</li>
            <li>• Look for 📊 Analytics Events Batch logs</li>
            <li>• Check localStorage for 'analytics_events'</li>
            <li>• Database events are tracked in qr_scans & share_clicks tables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}