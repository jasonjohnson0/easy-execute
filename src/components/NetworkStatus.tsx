import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline alert after 5 seconds when back online
    let timeout: NodeJS.Timeout;
    if (isOnline && showOfflineAlert) {
      timeout = setTimeout(() => setShowOfflineAlert(false), 5000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeout) clearTimeout(timeout);
    };
  }, [isOnline, showOfflineAlert]);

  if (!showOfflineAlert && isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className={`max-w-md mx-auto ${isOnline ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
        <AlertDescription className={isOnline ? 'text-green-800' : 'text-destructive'}>
          {isOnline 
            ? '✅ Back online! Your data is being synced.' 
            : '⚠️ You\'re offline. Some features may not work.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}