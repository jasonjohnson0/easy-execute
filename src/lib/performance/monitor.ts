import React from 'react';

// Performance monitoring and optimization utilities
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Monitor Core Web Vitals
    this.initializeWebVitals();
    
    // Monitor custom metrics
    this.initializeCustomMetrics();
    
    // Monitor resource loading
    this.initializeResourceMonitoring();
    
    // Monitor user interactions
    this.initializeInteractionMonitoring();
  }

  private initializeWebVitals() {
    // Import web-vitals dynamically to avoid bundle size impact
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(this.handleWebVital.bind(this));
      onFID(this.handleWebVital.bind(this));
      onFCP(this.handleWebVital.bind(this));
      onLCP(this.handleWebVital.bind(this));
      onTTFB(this.handleWebVital.bind(this));
    }).catch(() => {
      console.warn('Web Vitals library not available');
    });
  }

  private handleWebVital(metric: any) {
    const webVital: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      timestamp: Date.now(),
    };

    this.webVitals.push(webVital);
    this.reportWebVital(webVital);
  }

  private initializeCustomMetrics() {
    // Time to Interactive (custom implementation)
    this.measureTimeToInteractive();
    
    // Bundle size tracking
    this.measureBundleSize();
    
    // API response times
    this.measureApiPerformance();
  }

  private initializeResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.handleResourceTiming(entry as PerformanceResourceTiming);
          } else if (entry.entryType === 'navigation') {
            this.handleNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });

      this.observer.observe({ entryTypes: ['resource', 'navigation'] });
    }
  }

  private initializeInteractionMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('long-task', entry.duration);
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
    }

    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  private handleResourceTiming(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric(`resource-${resourceType}-duration`, entry.duration);
    this.recordMetric(`resource-${resourceType}-size`, entry.transferSize || 0);

    // Flag slow resources
    if (entry.duration > 1000) {
      console.warn(`Slow resource detected: ${entry.name} (${entry.duration}ms)`);
    }
  }

  private handleNavigationTiming(entry: PerformanceNavigationTiming) {
    this.recordMetric('dom-content-loaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
    this.recordMetric('load-event', entry.loadEventEnd - entry.loadEventStart);
    this.recordMetric('dns-lookup', entry.domainLookupEnd - entry.domainLookupStart);
    this.recordMetric('tcp-connection', entry.connectEnd - entry.connectStart);
  }

  private measureTimeToInteractive() {
    const startTime = performance.now();
    
    const checkInteractive = () => {
      if (document.readyState === 'complete') {
        const tti = performance.now() - startTime;
        this.recordMetric('time-to-interactive', tti);
      } else {
        requestAnimationFrame(checkInteractive);
      }
    };

    requestAnimationFrame(checkInteractive);
  }

  private measureBundleSize() {
    // Estimate bundle size from script tags
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('/assets/')) {
        // This is a rough estimation - in production you'd want actual bundle analysis
        totalSize += 100000; // Assume ~100KB per script
      }
    });

    this.recordMetric('estimated-bundle-size', totalSize);
  }

  private measureApiPerformance() {
    // Monkey patch fetch to measure API performance
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric('api-response-time', duration);
        
        if (duration > 2000) {
          console.warn(`Slow API request: ${args[0]} (${duration}ms)`);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('api-error-time', duration);
        throw error;
      }
    };
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory-used', memory.usedJSHeapSize);
        this.recordMetric('memory-total', memory.totalJSHeapSize);
        this.recordMetric('memory-limit', memory.jsHeapSizeLimit);
        
        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
    };

    this.metrics.push(metric);
    
    // Keep only last 100 metrics to avoid memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Report critical metrics immediately
    if (this.isCriticalMetric(name, value)) {
      this.reportMetric(metric);
    }
  }

  private isCriticalMetric(name: string, value: number): boolean {
    const thresholds = {
      'api-response-time': 3000,
      'resource-script-duration': 2000,
      'long-task': 50,
      'time-to-interactive': 5000,
    };

    return value > (thresholds[name as keyof typeof thresholds] || Infinity);
  }

  private reportWebVital(vital: WebVitalsMetric) {
    // In production, send to analytics service
    console.log(`Web Vital: ${vital.name} = ${vital.value} (${vital.rating})`);
    
    // Store locally for dashboard
    const stored = localStorage.getItem('web-vitals') || '[]';
    const vitals = JSON.parse(stored);
    vitals.push(vital);
    localStorage.setItem('web-vitals', JSON.stringify(vitals.slice(-50))); // Keep last 50
  }

  private reportMetric(metric: PerformanceMetric) {
    // In production, send to monitoring service
    console.log(`Performance Metric: ${metric.name} = ${metric.value}ms`);
  }

  // Public methods
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitals];
  }

  generateReport(): {
    summary: Record<string, number>;
    webVitals: WebVitalsMetric[];
    slowResources: PerformanceMetric[];
    recommendations: string[];
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes

    const summary: Record<string, number> = {};
    recentMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = 0;
      }
      summary[metric.name] = Math.max(summary[metric.name], metric.value);
    });

    const slowResources = recentMetrics.filter(m => 
      m.name.includes('resource') && m.value > 1000
    );

    const recommendations = this.generateRecommendations(summary, this.webVitals);

    return {
      summary,
      webVitals: this.webVitals,
      slowResources,
      recommendations,
    };
  }

  private generateRecommendations(summary: Record<string, number>, webVitals: WebVitalsMetric[]): string[] {
    const recommendations: string[] = [];

    // Check LCP
    const lcp = webVitals.find(v => v.name === 'LCP');
    if (lcp && lcp.rating !== 'good') {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and reducing server response times');
    }

    // Check CLS
    const cls = webVitals.find(v => v.name === 'CLS');
    if (cls && cls.rating !== 'good') {
      recommendations.push('Reduce Cumulative Layout Shift by specifying image dimensions and avoiding dynamic content insertion');
    }

    // Check bundle size
    if (summary['estimated-bundle-size'] > 500000) {
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }

    // Check API performance
    if (summary['api-response-time'] > 2000) {
      recommendations.push('Optimize API response times or implement request caching');
    }

    // Check memory usage
    if (summary['memory-used'] / summary['memory-limit'] > 0.7) {
      recommendations.push('Monitor for memory leaks and optimize memory usage');
    }

    return recommendations;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [report, setReport] = React.useState(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setReport(performanceMonitor.generateReport());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const generateReport = () => performanceMonitor.generateReport();
  
  return {
    report,
    generateReport,
    metrics: performanceMonitor.getMetrics(),
    webVitals: performanceMonitor.getWebVitals(),
  };
}
