import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminMetrics, useQRAnalytics } from '@/hooks/useAdminMetrics';
import { usePlatformAnalytics } from '@/hooks/usePlatformData';
import { UserManagement } from '@/components/admin/UserManagement';
import { BusinessManagement } from '@/components/admin/BusinessManagement';
import { DealManagement } from '@/components/admin/DealManagement';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { Users, Building2, Ticket, TrendingUp, Shield, Settings, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useAdminMetrics();
  const { data: qrAnalytics } = useQRAnalytics();
  const { data: platformAnalytics } = usePlatformAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  console.log('AdminDashboard render:', { 
    isAdmin, 
    authLoading, 
    hasUser: !!user, 
    userId: user?.id,
    userEmail: user?.email 
  });

  // Redirect non-admins
  if (authLoading) {
    console.log('Admin dashboard showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
          <p className="text-sm text-muted-foreground mt-2">
            User: {user?.email || 'Not logged in'} | Admin Loading: {authLoading.toString()}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('User is not admin, current state:', { 
      user: !!user, 
      userId: user?.id, 
      isAdmin,
      authLoading 
    });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              {user ? 'You do not have admin privileges' : 'Please log in to continue'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              User: {user?.email || 'Not logged in'} | Is Admin: {isAdmin.toString()}
            </p>
          </div>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  console.log('Admin dashboard rendering successfully');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          </div>
          <p className="text-muted-foreground">
            Complete platform oversight and management tools
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-2">
              <Building2 className="h-4 w-4" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Ticket className="h-4 w-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {metricsError ? (
              <div className="text-center text-destructive">
                <p>Error loading metrics: {metricsError.message}</p>
              </div>
            ) : (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          metrics?.total_users || 0
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          metrics?.total_businesses || 0
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          metrics?.total_deals || 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.active_deals || 0} active • {metrics?.inactive_deals || 0} inactive
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metricsLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          (metrics?.total_qr_scans || 0) + (metrics?.total_share_clicks || 0)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.total_qr_scans || 0} scans • {metrics?.total_share_clicks || 0} shares
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Deal Status Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Deal Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {metricsLoading ? (
                          <Skeleton className="w-full h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Active', value: metrics?.active_deals || 0, fill: '#16a34a' },
                                  { name: 'Inactive', value: metrics?.inactive_deals || 0, fill: '#dc2626' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {[
                                  { name: 'Active', value: metrics?.active_deals || 0, fill: '#16a34a' },
                                  { name: 'Inactive', value: metrics?.inactive_deals || 0, fill: '#dc2626' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {metricsLoading ? (
                          <Skeleton className="w-full h-full" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'QR Scans', value: metrics?.total_qr_scans || 0 },
                              { name: 'Share Clicks', value: metrics?.total_share_clicks || 0 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="businesses" className="mt-6">
            <BusinessManagement />
          </TabsContent>

          <TabsContent value="deals" className="mt-6">
            <DealManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {/* Platform Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Signups Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Signups (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={platformAnalytics?.user_signups_by_day || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="signups" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Business Signups Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Signups (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={platformAnalytics?.business_signups_by_day || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="signups" 
                          stroke="#16a34a" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Deals Created Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Deals Created (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={platformAnalytics?.deals_created_by_day || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="deals" 
                          stroke="#dc2626" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* QR Scans Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Scans (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={platformAnalytics?.qr_scans_by_day || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="scans" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}