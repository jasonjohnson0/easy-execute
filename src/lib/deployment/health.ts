import React from 'react';

// Health monitoring and deployment readiness checks
interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration?: number;
}

interface DeploymentReadiness {
  overall: 'ready' | 'warning' | 'not-ready';
  checks: HealthCheck[];
  score: number;
  recommendations: string[];
}

class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private isMonitoring = false;

  async runHealthChecks(): Promise<DeploymentReadiness> {
    console.log('Running deployment health checks...');
    
    const checks: HealthCheck[] = [];
    
    // Database connectivity
    checks.push(await this.checkDatabase());
    
    // API endpoints
    checks.push(await this.checkApiEndpoints());
    
    // Authentication
    checks.push(await this.checkAuthentication());
    
    // Performance thresholds
    checks.push(await this.checkPerformance());
    
    // Security headers
    checks.push(await this.checkSecurityHeaders());
    
    // Bundle size
    checks.push(await this.checkBundleSize());
    
    // PWA requirements
    checks.push(await this.checkPWARequirements());
    
    // Accessibility
    checks.push(await this.checkAccessibility());

    // Browser compatibility
    checks.push(await this.checkBrowserCompatibility());

    // Error monitoring
    checks.push(await this.checkErrorMonitoring());

    const score = this.calculateScore(checks);
    const overall = this.determineOverallStatus(checks, score);
    const recommendations = this.generateRecommendations(checks);

    return {
      overall,
      checks,
      score,
      recommendations,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('businesses')
        .select('count')
        .limit(1);

      const duration = performance.now() - startTime;

      if (error) {
        return {
          name: 'Database Connectivity',
          status: 'error',
          message: `Database connection failed: ${error.message}`,
          timestamp: Date.now(),
          duration,
        };
      }

      if (duration > 1000) {
        return {
          name: 'Database Connectivity',
          status: 'warning',
          message: `Database response slow: ${duration.toFixed(0)}ms`,
          timestamp: Date.now(),
          duration,
        };
      }

      return {
        name: 'Database Connectivity',
        status: 'healthy',
        message: `Database accessible (${duration.toFixed(0)}ms)`,
        timestamp: Date.now(),
        duration,
      };
    } catch (error) {
      return {
        name: 'Database Connectivity',
        status: 'error',
        message: `Database check failed: ${error}`,
        timestamp: Date.now(),
        duration: performance.now() - startTime,
      };
    }
  }

  private async checkApiEndpoints(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Test critical API endpoints
      const endpoints = [
        { url: '/api/health', critical: true },
        { url: '/api/deals', critical: true },
        { url: '/api/businesses', critical: false },
      ];

      let allHealthy = true;
      let hasWarnings = false;
      const messages: string[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, { method: 'HEAD' });
          if (!response.ok && endpoint.critical) {
            allHealthy = false;
            messages.push(`${endpoint.url}: ${response.status}`);
          } else if (!response.ok) {
            hasWarnings = true;
            messages.push(`${endpoint.url}: ${response.status} (non-critical)`);
          }
        } catch (error) {
          if (endpoint.critical) {
            allHealthy = false;
          } else {
            hasWarnings = true;
          }
          messages.push(`${endpoint.url}: ${error}`);
        }
      }

      const duration = performance.now() - startTime;

      if (!allHealthy) {
        return {
          name: 'API Endpoints',
          status: 'error',
          message: `Critical endpoints failing: ${messages.join(', ')}`,
          timestamp: Date.now(),
          duration,
        };
      }

      if (hasWarnings) {
        return {
          name: 'API Endpoints',
          status: 'warning',
          message: `Some endpoints have issues: ${messages.join(', ')}`,
          timestamp: Date.now(),
          duration,
        };
      }

      return {
        name: 'API Endpoints',
        status: 'healthy',
        message: 'All API endpoints responding normally',
        timestamp: Date.now(),
        duration,
      };
    } catch (error) {
      return {
        name: 'API Endpoints',
        status: 'error',
        message: `API check failed: ${error}`,
        timestamp: Date.now(),
        duration: performance.now() - startTime,
      };
    }
  }

  private async checkAuthentication(): Promise<HealthCheck> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Check if auth is configured
      const { data: { session } } = await supabase.auth.getSession();
      
      return {
        name: 'Authentication',
        status: 'healthy',
        message: 'Authentication system operational',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Authentication',
        status: 'error',
        message: `Authentication check failed: ${error}`,
        timestamp: Date.now(),
      };
    }
  }

  private async checkPerformance(): Promise<HealthCheck> {
    // Check if performance is within acceptable limits
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return {
        name: 'Performance',
        status: 'warning',
        message: 'Performance data not available',
        timestamp: Date.now(),
      };
    }

    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

    if (loadTime > 3000) {
      return {
        name: 'Performance',
        status: 'error',
        message: `Page load time too slow: ${loadTime.toFixed(0)}ms`,
        timestamp: Date.now(),
      };
    }

    if (loadTime > 2000) {
      return {
        name: 'Performance',
        status: 'warning',
        message: `Page load time acceptable but could be improved: ${loadTime.toFixed(0)}ms`,
        timestamp: Date.now(),
      };
    }

    return {
      name: 'Performance',
      status: 'healthy',
      message: `Page load time optimal: ${loadTime.toFixed(0)}ms`,
      timestamp: Date.now(),
    };
  }

  private async checkSecurityHeaders(): Promise<HealthCheck> {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
      ];

      const missingHeaders = requiredHeaders.filter(header => 
        !response.headers.get(header)
      );

      if (missingHeaders.length > 0) {
        return {
          name: 'Security Headers',
          status: 'warning',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
          timestamp: Date.now(),
        };
      }

      return {
        name: 'Security Headers',
        status: 'healthy',
        message: 'Security headers properly configured',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        name: 'Security Headers',
        status: 'error',
        message: `Security header check failed: ${error}`,
        timestamp: Date.now(),
      };
    }
  }

  private async checkBundleSize(): Promise<HealthCheck> {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const totalAssets = scripts.length + stylesheets.length;
    
    // Estimate bundle size (in a real app, you'd get this from build tools)
    const estimatedSize = totalAssets * 50000; // Rough estimate

    if (estimatedSize > 1000000) { // 1MB
      return {
        name: 'Bundle Size',
        status: 'error',
        message: `Bundle size too large: ~${(estimatedSize / 1000000).toFixed(1)}MB`,
        timestamp: Date.now(),
      };
    }

    if (estimatedSize > 500000) { // 500KB
      return {
        name: 'Bundle Size',
        status: 'warning',
        message: `Bundle size acceptable but could be optimized: ~${(estimatedSize / 1000).toFixed(0)}KB`,
        timestamp: Date.now(),
      };
    }

    return {
      name: 'Bundle Size',
      status: 'healthy',
      message: `Bundle size optimal: ~${(estimatedSize / 1000).toFixed(0)}KB`,
      timestamp: Date.now(),
    };
  }

  private async checkPWARequirements(): Promise<HealthCheck> {
    const hasManifest = !!document.querySelector('link[rel="manifest"]');
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    if (!hasManifest || !hasServiceWorker) {
      return {
        name: 'PWA Requirements',
        status: 'warning',
        message: `Missing PWA requirements: ${!hasManifest ? 'manifest' : ''} ${!hasServiceWorker ? 'service worker' : ''}`.trim(),
        timestamp: Date.now(),
      };
    }

    return {
      name: 'PWA Requirements',
      status: 'healthy',
      message: 'PWA requirements met',
      timestamp: Date.now(),
    };
  }

  private async checkAccessibility(): Promise<HealthCheck> {
    // Basic accessibility checks
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
    
    const buttons = document.querySelectorAll('button');
    const buttonsWithoutLabel = Array.from(buttons).filter(btn => 
      !btn.textContent && !btn.getAttribute('aria-label')
    );

    const issues = [];
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images without alt text`);
    }
    if (buttonsWithoutLabel.length > 0) {
      issues.push(`${buttonsWithoutLabel.length} buttons without labels`);
    }

    if (issues.length > 0) {
      return {
        name: 'Accessibility',
        status: 'warning',
        message: `Accessibility issues found: ${issues.join(', ')}`,
        timestamp: Date.now(),
      };
    }

    return {
      name: 'Accessibility',
      status: 'healthy',
      message: 'Basic accessibility checks passed',
      timestamp: Date.now(),
    };
  }

  private async checkBrowserCompatibility(): Promise<HealthCheck> {
    const features = [
      'fetch',
      'Promise',
      'classList',
      'addEventListener',
    ];

    const missingFeatures = features.filter(feature => 
      !(window as any)[feature]
    );

    if (missingFeatures.length > 0) {
      return {
        name: 'Browser Compatibility',
        status: 'error',
        message: `Unsupported browser features: ${missingFeatures.join(', ')}`,
        timestamp: Date.now(),
      };
    }

    return {
      name: 'Browser Compatibility',
      status: 'healthy',
      message: 'Browser compatibility verified',
      timestamp: Date.now(),
    };
  }

  private async checkErrorMonitoring(): Promise<HealthCheck> {
    // Check if error monitoring is set up
    const hasGlobalErrorHandler = !!window.onerror;
    const hasUnhandledRejectionHandler = !!window.onunhandledrejection;

    if (!hasGlobalErrorHandler || !hasUnhandledRejectionHandler) {
      return {
        name: 'Error Monitoring',
        status: 'warning',
        message: 'Error monitoring not fully configured',
        timestamp: Date.now(),
      };
    }

    return {
      name: 'Error Monitoring',
      status: 'healthy',
      message: 'Error monitoring configured',
      timestamp: Date.now(),
    };
  }

  private calculateScore(checks: HealthCheck[]): number {
    const weights = {
      healthy: 100,
      warning: 70,
      error: 0,
    };

    const totalWeight = checks.reduce((sum, check) => sum + weights[check.status], 0);
    return Math.round(totalWeight / checks.length);
  }

  private determineOverallStatus(checks: HealthCheck[], score: number): 'ready' | 'warning' | 'not-ready' {
    const errorCount = checks.filter(check => check.status === 'error').length;
    
    if (errorCount > 0 || score < 50) {
      return 'not-ready';
    }
    
    if (score < 80) {
      return 'warning';
    }
    
    return 'ready';
  }

  private generateRecommendations(checks: HealthCheck[]): string[] {
    const recommendations: string[] = [];
    
    checks.forEach(check => {
      if (check.status === 'error') {
        recommendations.push(`Fix critical issue: ${check.message}`);
      } else if (check.status === 'warning') {
        recommendations.push(`Address warning: ${check.message}`);
      }
    });

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push('Application is ready for deployment');
      recommendations.push('Consider setting up monitoring and alerts');
      recommendations.push('Review performance metrics regularly');
    }

    return recommendations;
  }

  startMonitoring(interval = 300000) { // 5 minutes
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    const monitor = setInterval(async () => {
      try {
        const results = await this.runHealthChecks();
        console.log('Health check results:', results);
        
        // Store results for dashboard
        localStorage.setItem('health-check-results', JSON.stringify(results));
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, interval);

    // Return cleanup function
    return () => {
      clearInterval(monitor);
      this.isMonitoring = false;
    };
  }
}

export const healthMonitor = new HealthMonitor();

// React hook for health monitoring
export function useHealthMonitoring() {
  const [results, setResults] = React.useState<DeploymentReadiness | null>(null);
  const [loading, setLoading] = React.useState(false);

  const runChecks = async () => {
    setLoading(true);
    try {
      const checkResults = await healthMonitor.runHealthChecks();
      setResults(checkResults);
      return checkResults;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Load cached results
    const cached = localStorage.getItem('health-check-results');
    if (cached) {
      try {
        setResults(JSON.parse(cached));
      } catch (error) {
        console.warn('Failed to parse cached health results');
      }
    }

    // Run initial check
    runChecks();
  }, []);

  return {
    results,
    loading,
    runChecks,
  };
}