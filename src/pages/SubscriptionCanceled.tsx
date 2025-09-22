import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Heart } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionCanceled() {
  const { createCheckout, isCreatingCheckout } = useSubscription();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-background to-red-50/50">
      <div className="container px-4 py-8 max-w-lg">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-orange-600" />
            </div>
            <CardTitle className="text-2xl lg:text-3xl font-bold text-orange-700">
              Subscription Canceled
            </CardTitle>
            <p className="text-muted-foreground">
              No worries! You can try again anytime.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your subscription wasn't created, so you haven't been charged.
              </p>
            </div>

            <div className="bg-background/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Still interested?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Join thousands of locals saving money with exclusive deals
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => createCheckout({ applyFirstTimeDiscount: true })}
                disabled={isCreatingCheckout}
                size="lg" 
                className="text-lg px-8"
              >
                {isCreatingCheckout ? 'Creating Checkout...' : 'Try Again - $28 First Year'}
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <a href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Homepage
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Questions? Contact us anytime for help
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}