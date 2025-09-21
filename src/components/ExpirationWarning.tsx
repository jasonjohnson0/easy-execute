import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { format, differenceInDays, differenceInHours, isAfter, isBefore, addDays } from 'date-fns';

interface ExpirationWarningProps {
  expiresAt: string;
  className?: string;
  onExtend?: () => void;
  showExtendOption?: boolean;
}

export function ExpirationWarning({ 
  expiresAt, 
  className = '', 
  onExtend, 
  showExtendOption = false 
}: ExpirationWarningProps) {
  const [isExtending, setIsExtending] = useState(false);
  
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = differenceInDays(expirationDate, now);
  const hoursUntilExpiry = differenceInHours(expirationDate, now);
  
  const isExpired = isBefore(expirationDate, now);
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  const isExpiringToday = daysUntilExpiry === 0 && hoursUntilExpiry > 0;
  const isExpiringInHours = hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;

  const handleExtend = async () => {
    if (!onExtend) return;
    
    setIsExtending(true);
    try {
      await onExtend();
    } finally {
      setIsExtending(false);
    }
  };

  const getWarningLevel = () => {
    if (isExpired) return 'expired';
    if (isExpiringInHours) return 'critical';
    if (isExpiringSoon) return 'warning';
    return 'normal';
  };

  const getWarningMessage = () => {
    if (isExpired) {
      return 'This deal has expired and is no longer visible to customers';
    }
    if (isExpiringToday) {
      return `Expires today at ${format(expirationDate, 'h:mm a')}`;
    }
    if (isExpiringInHours) {
      return `Expires in ${hoursUntilExpiry} hour${hoursUntilExpiry === 1 ? '' : 's'}`;
    }
    if (isExpiringSoon) {
      return `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`;
    }
    return `Expires ${format(expirationDate, 'MMM d, yyyy')}`;
  };

  const getBadgeVariant = () => {
    const level = getWarningLevel();
    switch (level) {
      case 'expired':
        return 'destructive';
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIcon = () => {
    const level = getWarningLevel();
    switch (level) {
      case 'expired':
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return Clock;
      default:
        return Calendar;
    }
  };

  const warningLevel = getWarningLevel();
  const Icon = getIcon();

  if (warningLevel === 'normal' && !showExtendOption) {
    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <Calendar className="w-3 h-3" />
        {getWarningMessage()}
      </Badge>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Badge variant={getBadgeVariant()} className="gap-1">
        <Icon className="w-3 h-3" />
        {getWarningMessage()}
      </Badge>

      {(warningLevel === 'expired' || warningLevel === 'critical' || warningLevel === 'warning') && (
        <Alert variant={warningLevel === 'expired' ? 'destructive' : 'default'}>
          <Icon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {warningLevel === 'expired' 
                ? 'This deal is no longer active. Consider creating a new deal to re-engage customers.'
                : 'Your deal is expiring soon. Extend it to keep it active for customers.'
              }
            </span>
            {showExtendOption && onExtend && !isExpired && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExtend}
                disabled={isExtending}
                className="ml-2 gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isExtending ? 'animate-spin' : ''}`} />
                Extend
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}