import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Share,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalViews: number;
  totalPrints: number;
  totalDeals: number;
  totalBusinesses: number;
  viewsChange: number;
  printsChange: number;
  dealsChange: number;
  businessesChange: number;
}

interface DealPerformance {
  id: string;
  title: string;
  views: number;
  prints: number;
  conversionRate: number;
  category: string;
}

interface TimeSeriesData {
  date: string;
  views: number;
  prints: number;
  deals: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalPrints: 0,
    totalDeals: 0,
    totalBusinesses: 0,
    viewsChange: 0,
    printsChange: 0,
    dealsChange: 0,
    businessesChange: 0,
  });
  
  const [topDeals, setTopDeals] = useState<DealPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; deals: number }[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, user]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Mock data for demonstration - in production, this would come from your analytics backend
      const mockAnalytics: AnalyticsData = {
        totalViews: Math.floor(Math.random() * 10000) + 5000,
        totalPrints: Math.floor(Math.random() * 1000) + 500,
        totalDeals: Math.floor(Math.random() * 50) + 25,
        totalBusinesses: Math.floor(Math.random() * 20) + 10,
        viewsChange: (Math.random() - 0.5) * 30,
        printsChange: (Math.random() - 0.5) * 20,
        dealsChange: (Math.random() - 0.5) * 40,
        businessesChange: (Math.random() - 0.5) * 15,
      };

      const mockTopDeals: DealPerformance[] = [
        {
          id: '1',
          title: '50% Off Pizza Special',
          views: 1200,
          prints: 89,
          conversionRate: 7.4,
          category: 'Restaurant',
        },
        {
          id: '2',
          title: 'Buy One Get One Coffee',
          views: 980,
          prints: 156,
          conversionRate: 15.9,
          category: 'Restaurant',
        },
        {
          id: '3',
          title: '30% Off Clothing Sale',
          views: 850,
          prints: 42,
          conversionRate: 4.9,
          category: 'Retail',
        },
        {
          id: '4',
          title: 'Free Haircut Consultation',
          views: 720,
          prints: 78,
          conversionRate: 10.8,
          category: 'Health & Beauty',
        },
        {
          id: '5',
          title: '$10 Off Oil Change',
          views: 650,
          prints: 34,
          conversionRate: 5.2,
          category: 'Automotive',
        },
      ];

      const mockTimeSeriesData: TimeSeriesData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockTimeSeriesData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: Math.floor(Math.random() * 500) + 200,
          prints: Math.floor(Math.random() * 50) + 20,
          deals: Math.floor(Math.random() * 5) + 2,
        });
      }

      const mockCategoryData = [
        { name: 'Restaurant', value: 35, deals: 12 },
        { name: 'Retail', value: 25, deals: 8 },
        { name: 'Health & Beauty', value: 20, deals: 6 },
        { name: 'Services', value: 12, deals: 4 },
        { name: 'Entertainment', value: 8, deals: 3 },
      ];

      setAnalyticsData(mockAnalytics);
      setTopDeals(mockTopDeals);
      setTimeSeriesData(mockTimeSeriesData);
      setCategoryData(mockCategoryData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any; 
    format?: 'number' | 'currency' | 'percentage' 
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString();
      }
    };

    const isPositive = change >= 0;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">vs last period</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user?.businessProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Analytics dashboard is only available for business owners.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your deals performance and business insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadAnalyticsData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={analyticsData.totalViews}
          change={analyticsData.viewsChange}
          icon={Eye}
        />
        <MetricCard
          title="Total Prints"
          value={analyticsData.totalPrints}
          change={analyticsData.printsChange}
          icon={Download}
        />
        <MetricCard
          title="Active Deals"
          value={analyticsData.totalDeals}
          change={analyticsData.dealsChange}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Conversion Rate"
          value={(analyticsData.totalPrints / analyticsData.totalViews) * 100}
          change={analyticsData.printsChange - analyticsData.viewsChange}
          icon={TrendingUp}
          format="percentage"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deal Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="prints"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          {/* Top Performing Deals */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDeals.map((deal, index) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{deal.title}</h4>
                        <Badge variant="secondary">{deal.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {deal.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {deal.prints.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {deal.conversionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Deals by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deals" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}