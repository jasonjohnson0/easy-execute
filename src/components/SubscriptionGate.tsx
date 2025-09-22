import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Users, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showPreview?: boolean;
}

export function SubscriptionGate({ children, fallback, showPreview = false }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { isSubscribed, isCheckingSubscription, createCheckout, isCreatingCheckout } = useSubscription();

  // If user is not authenticated, show children (they'll see teasers from the parent component)
  if (!user) {
    return <>{children}</>;
  }

  // If still checking subscription status, show loading
  if (isCheckingSubscription) {
    return <>{children}</>;
  }

  // If user has valid subscription, show content
  if (isSubscribed) {
    return <>{children}</>;
  }

  // User is authenticated but doesn't have subscription - show paywall
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Unlock All Deals</CardTitle>
          <p className="text-muted-foreground">
            Subscribe to access hundreds of local deals and start saving today!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Annual Membership
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold">$28</div>
                <div className="text-sm text-muted-foreground line-through">$30</div>
                <div className="text-xs text-green-600 font-medium">First year discount!</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm">Unlimited access to all local deals</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Printable coupons and instant savings</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm">Support your local community</span>
            </div>
          </div>

          <Button 
            onClick={() => createCheckout({ applyFirstTimeDiscount: true })}
            disabled={isCreatingCheckout}
            size="lg" 
            className="w-full text-lg"
          >
            {isCreatingCheckout ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Creating Checkout...
              </>
            ) : (
              'Subscribe Now - $28/year'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime • No commitments • Immediate access
          </p>
        </CardContent>
      </Card>
    </div>
  );
}