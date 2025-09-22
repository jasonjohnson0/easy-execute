import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, ExternalLink, CreditCard, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

export function SubscriptionStatus() {
  const { 
    subscription, 
    isSubscribed, 
    isCheckingSubscription, 
    isExpired,
    createCheckout, 
    isCreatingCheckout,
    openCustomerPortal,
    isOpeningPortal
  } = useSubscription();

  if (isCheckingSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted animate-pulse rounded" />
            <span className="text-muted-foreground">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed && !isExpired) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Subscribe to unlock unlimited access to all local deals and start saving today!
          </p>
          
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Annual Membership</div>
                <div className="text-sm text-muted-foreground">Unlimited deal access</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">$28</div>
                <div className="text-xs text-green-600">First year discount!</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => createCheckout({ applyFirstTimeDiscount: true })}
            disabled={isCreatingCheckout}
            size="lg" 
            className="w-full"
          >
            {isCreatingCheckout ? 'Creating Checkout...' : 'Subscribe Now'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Subscription Expired
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your subscription has expired. Renew now to regain access to all deals.
          </p>
          
          {subscription?.expires_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Expired on {format(new Date(subscription.expires_at), 'PPP')}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={() => createCheckout({})}
              disabled={isCreatingCheckout}
              className="flex-1"
            >
              {isCreatingCheckout ? 'Creating Checkout...' : 'Renew Subscription'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openCustomerPortal()}
              disabled={isOpeningPortal}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Active Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Annual Membership
          </Badge>
          <span className="text-sm font-medium">$30/year</span>
        </div>

        {subscription?.expires_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Renews on {format(new Date(subscription.expires_at), 'PPP')}
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            ✅ You have unlimited access to all local deals and can print coupons instantly!
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={() => openCustomerPortal()}
          disabled={isOpeningPortal}
          className="w-full"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isOpeningPortal ? 'Opening Portal...' : 'Manage Subscription'}
        </Button>
      </CardContent>
    </Card>
  );
}