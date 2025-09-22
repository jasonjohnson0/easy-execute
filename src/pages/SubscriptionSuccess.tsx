import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Gift, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refetchSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Trigger subscription check after successful payment
    if (sessionId && user) {
      localStorage.setItem('subscription-success', 'true');
      // Delay to allow Stripe to process
      setTimeout(() => {
        refetchSubscription();
        setIsLoading(false);
      }, 3000);
    } else if (!sessionId) {
      setIsLoading(false);
    }
  }, [sessionId, user, refetchSubscription]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold">Processing your subscription...</h2>
              <p className="text-muted-foreground">This will just take a moment!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4 py-8 max-w-2xl">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl lg:text-3xl font-bold text-green-700">
              Welcome to Deal Hunter!
            </CardTitle>
            <p className="text-muted-foreground">
              Your annual membership is now active
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <Gift className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Unlimited Access</h3>
                  <p className="text-sm text-muted-foreground">Browse all local deals</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Support Local</h3>
                  <p className="text-sm text-muted-foreground">Help your community</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Annual Membership - $30/year
              </Badge>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <a href="/">Start Browsing Deals</a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You can manage your subscription anytime from your profile
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}