import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/lib/performance/monitor';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function PerformanceDashboard() {
  const { report, generateReport, metrics, webVitals } = usePerformanceMonitoring();
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const newReport = generateReport();
      setCurrentReport(newReport);
    } finally {
      setLoading(false);
    }
  };

  const getWebVitalRating = (name: string, value: number) => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const WebVitalCard = ({ name, value, description }: { name: string; value: number; description: string }) => {
    const rating = getWebVitalRating(name, value);
    const colors = {
      good: 'text-green-600 bg-green-100',
      'needs-improvement': 'text-yellow-600 bg-yellow-100',
      poor: 'text-red-600 bg-red-100',
      unknown: 'text-gray-600 bg-gray-100',
    };

    const icons = {
      good: CheckCircle,
      'needs-improvement': AlertTriangle,
      poor: AlertTriangle,
      unknown: Clock,
    };

    const Icon = icons[rating];

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{name}</h3>
                <Badge className={colors[rating]}>
                  <Icon className="h-3 w-3 mr-1" />
                  {rating.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-2xl font-bold">
                {name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`}
              </p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MetricCard = ({ title, value, unit, icon: Icon, change }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    change?: number;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {value.toLocaleString()}{unit}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Process metrics for charts
  const processMetricsForChart = () => {
    if (!metrics.length) return [];

    const grouped = metrics.reduce((acc, metric) => {
      const key = metric.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([name, values]) => ({
      name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avg: values.reduce((sum, v) => sum + v.value, 0) / values.length,
      max: Math.max(...values.map(v => v.value)),
      count: values.length,
    }));
  };

  const chartData = processMetricsForChart();

  // Sample data for demonstration
  const sampleWebVitals = [
    { name: 'LCP', value: 2100, description: 'Largest Contentful Paint' },
    { name: 'FID', value: 85, description: 'First Input Delay' },
    { name: 'CLS', value: 0.08, description: 'Cumulative Layout Shift' },
    { name: 'FCP', value: 1600, description: 'First Contentful Paint' },
    { name: 'TTFB', value: 650, description: 'Time to First Byte' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor Core Web Vitals and application performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Page Load Time"
          value={2.3}
          unit="s"
          icon={Clock}
          change={-12.5}
        />
        <MetricCard
          title="API Response Time"
          value={245}
          unit="ms"
          icon={Activity}
          change={8.2}
        />
        <MetricCard
          title="Bundle Size"
          value={487}
          unit="KB"
          icon={Download}
          change={-5.1}
        />
        <MetricCard
          title="Performance Score"
          value={92}
          unit="/100"
          icon={Zap}
          change={3.4}
        />
      </div>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-6">
          {/* Core Web Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sampleWebVitals.map((vital) => (
              <WebVitalCard
                key={vital.name}
                name={vital.name}
                value={vital.value}
                description={vital.description}
              />
            ))}
          </div>

          {/* Web Vitals Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { time: '00:00', LCP: 2100, FID: 85, CLS: 0.08 },
                  { time: '00:05', LCP: 1950, FID: 92, CLS: 0.06 },
                  { time: '00:10', LCP: 2300, FID: 78, CLS: 0.09 },
                  { time: '00:15', LCP: 1800, FID: 88, CLS: 0.07 },
                  { time: '00:20', LCP: 2100, FID: 85, CLS: 0.08 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="LCP" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="FID" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Device Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Desktop', value: 65, performance: 95 },
                        { name: 'Mobile', value: 30, performance: 78 },
                        { name: 'Tablet', value: 5, performance: 88 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">23%</span>
                </div>
                <Progress value={23} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">47MB / 128MB</span>
                </div>
                <Progress value={37} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network Activity</span>
                  <span className="text-sm text-muted-foreground">Low</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Performance Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Optimizations Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Image lazy loading enabled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Service worker caching active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Bundle splitting implemented</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">CSS minification active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Optimize images</p>
                      <p className="text-xs text-muted-foreground">Convert to WebP format for better compression</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Reduce API calls</p>
                      <p className="text-xs text-muted-foreground">Implement request batching and caching</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Enable compression</p>
                      <p className="text-xs text-muted-foreground">Configure gzip/brotli compression on server</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">JavaScript Budget</span>
                    <span className="text-sm text-muted-foreground">387KB / 500KB</span>
                  </div>
                  <Progress value={77} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CSS Budget</span>
                    <span className="text-sm text-muted-foreground">45KB / 100KB</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Image Budget</span>
                    <span className="text-sm text-muted-foreground">1.2MB / 2MB</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}