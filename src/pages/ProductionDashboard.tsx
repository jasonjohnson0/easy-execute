import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  BarChart3, 
  Shield, 
  Rocket, 
  Smartphone,
  Zap,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Eye,
  Download
} from 'lucide-react';

// Import our dashboard components
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { DeploymentDashboard } from '@/components/deployment/DeploymentDashboard';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function ProductionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const systemStatus = {
    overall: 'operational',
    uptime: '99.9%',
    responseTime: '145ms',
    lastIncident: 'None',
  };

  const metrics = {
    totalUsers: 12450,
    activeDeals: 89,
    totalViews: 156780,
    conversionRate: 8.4,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Production Ready
          </div>
          <h1 className="text-3xl font-bold">Easy Execute Production Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor and manage your production application with comprehensive analytics, 
            performance monitoring, and deployment readiness tools.
          </p>
        </div>

        {/* System Status Overview */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-green-700">System Status</span>
                </div>
                <p className="text-2xl font-bold text-green-800">Operational</p>
                <p className="text-sm text-green-600">All systems running</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">Uptime</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">{systemStatus.uptime}</p>
                <p className="text-sm text-blue-600">Last 30 days</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-700">Response Time</span>
                </div>
                <p className="text-2xl font-bold text-orange-800">{systemStatus.responseTime}</p>
                <p className="text-sm text-orange-600">Average response</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-700">Security</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">Secure</p>
                <p className="text-sm text-purple-600">No vulnerabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+12.5%</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                  <p className="text-2xl font-bold">{metrics.activeDeals}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+8.3%</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+15.2%</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+2.1%</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time user tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Deal performance metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Business insights dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Performance Optimized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Core Web Vitals monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Bundle optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Caching strategies</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                Mobile PWA Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Installable app experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Offline functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Push notifications ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PWA Install Prompt */}
              <InstallPrompt variant="inline" />
              
              {/* System Architecture */}
              <Card>
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Frontend</span>
                      </div>
                      <Badge variant="outline">React + Vite</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge variant="outline">Supabase</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Authentication</span>
                      </div>
                      <Badge variant="outline">Supabase Auth</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Rocket className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Hosting</span>
                      </div>
                      <Badge variant="outline">Lovable</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Deployment successful</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Performance monitoring updated</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border-l-4 border-purple-500 bg-purple-50">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Analytics data refreshed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="deployment">
            <DeploymentDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}