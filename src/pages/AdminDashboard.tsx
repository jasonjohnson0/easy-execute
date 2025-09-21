import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Building2, Tag, QrCode, Share2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminMetrics, useQRAnalytics } from '@/hooks/useAdminMetrics';
import { useAuth } from '@/hooks/useAuth';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { data: metrics, isLoading: metricsLoading, error } = useAdminMetrics();
  const { data: qrAnalytics } = useQRAnalytics();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4">
        <div className="container mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4">
        <div className="container mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load admin metrics. Please check your permissions and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const dealStatusData = metrics ? [
    { name: 'Active Deals', value: metrics.active_deals, color: COLORS[0] },
    { name: 'Inactive Deals', value: metrics.inactive_deals, color: COLORS[1] }
  ] : [];

  const engagementData = metrics ? [
    { name: 'QR Scans', value: metrics.total_qr_scans },
    { name: 'Share Clicks', value: metrics.total_share_clicks }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}. Here's an overview of your platform.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_users || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_businesses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered businesses
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metricsLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_deals || 0}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  {metrics?.active_deals || 0} Active
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {metrics?.inactive_deals || 0} Inactive
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {metricsLoading ? <Skeleton className="h-4 w-12" /> : metrics?.total_qr_scans || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">QR Scans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {metricsLoading ? <Skeleton className="h-4 w-12" /> : metrics?.total_share_clicks || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">Shares</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Deal Status Chart */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>Deal Status Distribution</CardTitle>
              <CardDescription>Active vs Inactive deals breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ChartContainer
                  config={{
                    active: { label: "Active", color: COLORS[0] },
                    inactive: { label: "Inactive", color: COLORS[1] }
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dealStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {dealStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>QR scans and share clicks comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ChartContainer
                  config={{
                    qr: { label: "QR Scans", color: COLORS[0] },
                    shares: { label: "Share Clicks", color: COLORS[1] }
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill={COLORS[0]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Analytics Trend */}
        {qrAnalytics && Array.isArray(qrAnalytics) && qrAnalytics.length > 0 && (
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>QR Scan Trends</CardTitle>
              <CardDescription>Daily QR code scan activity over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  scans: { label: "Scans", color: COLORS[0] }
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.isArray(qrAnalytics) ? qrAnalytics : []}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke={COLORS[0]} 
                      strokeWidth={2}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}