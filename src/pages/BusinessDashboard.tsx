import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Eye, 
  Printer, 
  TrendingUp, 
  Calendar,
  CreditCard,
  Settings,
  BarChart3,
  Store,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { mockDeals, USE_MOCK_DEALS } from '@/data/mockData';
import type { Deal } from '@/types/database';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function BusinessDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeals: 0,
    activeDeals: 0,
    totalViews: 0,
    totalPrints: 0
  });

  // Check if business profile is complete
  const isBusinessProfileComplete = (profile: any) => {
    // Temporarily always return false for demo purposes
    return false;
    // return profile && 
    //        profile.name && 
    //        profile.description && 
    //        profile.category && 
    //        profile.address;
  };

  useEffect(() => {
    if (!authLoading && (!user || !user.businessProfile)) {
      toast({
        title: "Access Denied",
        description: "You need to be signed in as a business owner to access this page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (user?.businessProfile) {
      fetchBusinessDeals();
    }
  }, [user, authLoading, navigate]);

  const fetchBusinessDeals = async () => {
    if (!user?.businessProfile) return;

    setLoading(true);
    
    if (USE_MOCK_DEALS) {
      // Filter mock deals for this business (simulate business ownership)
      const businessDeals = mockDeals.slice(0, 2); // Simulate 2 deals for demo
      setDeals(businessDeals);
      
      // Calculate stats
      const totalViews = businessDeals.reduce((sum, deal) => sum + deal.views, 0);
      const totalPrints = businessDeals.reduce((sum, deal) => sum + deal.prints, 0);
      const activeDeals = businessDeals.filter(deal => deal.is_active).length;
      
      setStats({
        totalDeals: businessDeals.length,
        activeDeals,
        totalViews,
        totalPrints
      });
    } else {
      try {
        const { data: businessDeals } = await (supabase as any)
          .from('deals')
          .select('*')
          .eq('business_id', user.businessProfile.id)
          .order('created_at', { ascending: false });

        if (businessDeals) {
          setDeals(businessDeals as Deal[]);
          
          // Calculate stats
          const totalViews = businessDeals.reduce((sum, deal) => sum + deal.views, 0);
          const totalPrints = businessDeals.reduce((sum, deal) => sum + deal.prints, 0);
          const activeDeals = businessDeals.filter(deal => deal.is_active).length;
          
          setStats({
            totalDeals: businessDeals.length,
            activeDeals,
            totalViews,
            totalPrints
          });
        }
      } catch (error) {
        console.error('Error fetching business deals:', error);
        toast({
          title: "Error",
          description: "Failed to load your deals. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    setLoading(false);
  };

  const toggleDealStatus = async (dealId: string, currentStatus: boolean) => {
    try {
      if (!USE_MOCK_DEALS) {
        const { error } = await (supabase as any)
          .from('deals')
          .update({ is_active: !currentStatus })
          .eq('id', dealId);

        if (error) throw error;
      }

      // Update local state
      setDeals(deals.map(deal => 
        deal.id === dealId 
          ? { ...deal, is_active: !currentStatus }
          : deal
      ));

      toast({
        title: "Deal Updated",
        description: `Deal ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal status.",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-7xl">
          <div className="grid gap-6">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user?.businessProfile) {
    return null; // Will redirect in useEffect
  }

  // Show setup overlay if business profile is incomplete
  if (!isBusinessProfileComplete(user.businessProfile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Plus className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-primary/20 animate-ping" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Set Up Your Business Profile</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Before you can create deals and start attracting customers, let's complete your business profile.
            This helps customers find and trust your business.
          </p>
          
          <div className="bg-card border rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4">What we need:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.businessProfile.name ? 'bg-green-500' : 'bg-muted'}`}>
                  {user.businessProfile.name ? '✓' : '○'}
                </div>
                <span className={user.businessProfile.name ? 'text-foreground' : 'text-muted-foreground'}>
                  Business Name {user.businessProfile.name ? '✓' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.businessProfile.description ? 'bg-green-500' : 'bg-muted'}`}>
                  {user.businessProfile.description ? '✓' : '○'}
                </div>
                <span className={user.businessProfile.description ? 'text-foreground' : 'text-muted-foreground'}>
                  Business Description {user.businessProfile.description ? '✓' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.businessProfile.category ? 'bg-green-500' : 'bg-muted'}`}>
                  {user.businessProfile.category ? '✓' : '○'}
                </div>
                <span className={user.businessProfile.category ? 'text-foreground' : 'text-muted-foreground'}>
                  Business Category {user.businessProfile.category ? '✓' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.businessProfile.address ? 'bg-green-500' : 'bg-muted'}`}>
                  {user.businessProfile.address ? '✓' : '○'}
                </div>
                <span className={user.businessProfile.address ? 'text-foreground' : 'text-muted-foreground'}>
                  Business Address {user.businessProfile.address ? '✓' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            size="lg"
            className="text-lg px-8 py-6 gap-3"
            onClick={() => navigate('/business-setup')}
          >
            <Plus className="w-5 h-5" />
            Complete Your Business Profile
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            This will only take a few minutes and you can always update it later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.businessProfile.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Store className="w-3 h-3" />
              {user.businessProfile.subscription_status === 'trial' ? 'Trial Account' : 'Active Account'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeDeals} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Across all deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prints</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrints}</div>
              <p className="text-xs text-muted-foreground">
                Coupons printed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalViews > 0 ? Math.round((stats.totalPrints / stats.totalViews) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Views to prints
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant="hero"
            onClick={() => navigate('/create-deal')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Deal
          </Button>
          
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Manage Subscription
          </Button>
          
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Deals</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/create-deal')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Deal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first deal to start attracting customers
                </p>
                <Button
                  variant="hero"
                  onClick={() => navigate('/create-deal')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Deal
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Deal</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Views</th>
                      <th className="text-left py-3 px-2">Prints</th>
                      <th className="text-left py-3 px-2">Expires</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal.id} className="border-b">
                        <td className="py-4 px-2">
                          <div>
                            <div className="font-medium">{deal.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` :
                               deal.discount_type === 'fixed' ? `$${deal.discount_value} OFF` :
                               deal.discount_value}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant={deal.is_active ? "success" : "secondary"}>
                            {deal.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {deal.views}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Printer className="w-4 h-4 text-muted-foreground" />
                            {deal.prints}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {format(new Date(deal.expires_at), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleDealStatus(deal.id, deal.is_active)}
                            >
                              {deal.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}