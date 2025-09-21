import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Rocket,
  Shield,
  Activity,
  Database,
  Globe,
  Smartphone,
  Zap,
  Eye,
  Download,
} from 'lucide-react';
import { useHealthMonitoring } from '@/lib/deployment/health';

export function DeploymentDashboard() {
  const { results, loading, runChecks } = useHealthMonitoring();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    if (results) {
      setLastCheck(new Date());
    }
  }, [results]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <Rocket className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'not-ready':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleRunChecks = async () => {
    await runChecks();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Deployment Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor deployment readiness and system health
          </p>
          {lastCheck && (
            <p className="text-sm text-muted-foreground mt-1">
              Last checked: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button 
          onClick={handleRunChecks}
          disabled={loading}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Health Checks
        </Button>
      </div>

      {/* Overall Status */}
      {results && (
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getOverallStatusIcon(results.overall)}
                <div>
                  <h2 className="text-xl font-semibold">
                    {results.overall === 'ready' && 'Ready for Deployment'}
                    {results.overall === 'warning' && 'Deployment with Warnings'}
                    {results.overall === 'not-ready' && 'Not Ready for Deployment'}
                  </h2>
                  <p className="text-muted-foreground">
                    System health score: {results.score}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {results.score}%
                </div>
                <Progress value={results.score} className="w-24 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Checks */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.checks.map((check, index) => (
            <Card key={index} className={`border ${getStatusColor(check.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm">{check.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {check.message}
                      </p>
                      {check.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {check.duration.toFixed(0)}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(check.status)}`}
                  >
                    {check.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {results && results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>HTTPS enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Security headers configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Authentication working</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span>Rate limiting configured</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Bundle optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Image optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Caching strategies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Core Web Vitals</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backend
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Database connectivity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>API endpoints tested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Error handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span>Backup strategy</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile & PWA
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Responsive design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>PWA manifest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Service worker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Offline functionality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Build Production</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                npm run build
              </code>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Preview Build</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                npm run preview
              </code>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Deploy to Lovable</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                # Use the Publish button in Lovable editor
              </code>
            </div>

            <div>
              <h4 className="font-medium mb-2">Export to GitHub</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                # Use GitHub integration in Lovable editor
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Production Environment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>NODE_ENV</span>
                    <Badge variant="outline">production</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supabase URL</span>
                    <Badge variant="outline">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Monitoring</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Error Tracking</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performance Monitor</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Health Checks</span>
                    <Badge variant="outline">Configured</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}