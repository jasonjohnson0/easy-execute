// Analytics tracking system
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

interface UserProperties {
  userId: string;
  userType: 'deal_hunter' | 'business_owner';
  properties: Record<string, any>;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties | null = null;
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    this.track('session_start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Track events
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now(),
      },
      userId: this.userProperties?.userId,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    
    // Store in localStorage for persistence
    this.persistEvents();
    
    // Send to backend if online
    if (navigator.onLine) {
      this.sendEvents();
    }
    
    // Also log individual events for debugging
    console.log(`🔍 Analytics: ${event}`, properties);
  }

  // Set user properties
  identify(userId: string, userType: 'deal_hunter' | 'business_owner', properties: Record<string, any> = {}) {
    this.userProperties = {
      userId,
      userType,
      properties: {
        ...properties,
        identifiedAt: Date.now(),
      },
    };

    this.track('user_identified', {
      userType,
      ...properties,
    });
  }

  // Page view tracking
  page(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page: pageName,
      title: document.title,
      ...properties,
    });
  }

  // Deal interactions
  dealView(dealId: string, dealTitle: string, businessId: string) {
    this.track('deal_viewed', {
      dealId,
      dealTitle,
      businessId,
    });
  }

  dealPrint(dealId: string, dealTitle: string, businessId: string) {
    this.track('deal_printed', {
      dealId,
      dealTitle,
      businessId,
    });
  }

  dealShare(dealId: string, dealTitle: string, method: string) {
    this.track('deal_shared', {
      dealId,
      dealTitle,
      shareMethod: method,
    });
  }

  dealFavorite(dealId: string, dealTitle: string, action: 'add' | 'remove') {
    this.track('deal_favorited', {
      dealId,
      dealTitle,
      action,
    });
  }

  // Search interactions
  searchPerformed(query: string, filters: Record<string, any>, resultCount: number) {
    this.track('search_performed', {
      query,
      filters,
      resultCount,
    });
  }

  // Business interactions
  businessProfileView(businessId: string, businessName: string) {
    this.track('business_profile_viewed', {
      businessId,
      businessName,
    });
  }

  dealCreated(dealId: string, dealTitle: string, discountType: string, discountValue: string) {
    this.track('deal_created', {
      dealId,
      dealTitle,
      discountType,
      discountValue,
    });
  }

  // Form interactions
  formStarted(formName: string) {
    this.track('form_started', {
      formName,
    });
  }

  formCompleted(formName: string, timeSpent: number) {
    this.track('form_completed', {
      formName,
      timeSpent,
    });
  }

  formAbandoned(formName: string, timeSpent: number, lastField: string) {
    this.track('form_abandoned', {
      formName,
      timeSpent,
      lastField,
    });
  }

  // Error tracking
  error(errorMessage: string, errorStack?: string, context?: Record<string, any>) {
    this.track('error_occurred', {
      errorMessage,
      errorStack,
      context,
    });
  }

  // Performance tracking
  performance(metric: string, value: number, context?: Record<string, any>) {
    this.track('performance_metric', {
      metric,
      value,
      context,
    });
  }

  // Persist events to localStorage
  private persistEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.warn('Failed to persist analytics events:', error);
    }
  }

  // Load persisted events
  private loadPersistedEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load persisted analytics events:', error);
      return [];
    }
  }

  // Send events to backend
  private async sendEvents() {
    if (this.events.length === 0) return;

    try {
      // Send events to console for debugging
      console.log('📊 Analytics Events:', this.events);
      
      // In production, send to your analytics backend
      // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(this.events) });
      
      // Clear sent events
      this.events = [];
      localStorage.removeItem('analytics_events');
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
    }
  }

  // Get session analytics
  getSessionAnalytics() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      eventCount: this.events.length,
      userProperties: this.userProperties,
    };
  }

  // Flush events (send immediately)
  flush() {
    if (navigator.onLine) {
      this.sendEvents();
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsTracker();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
    dealView: analytics.dealView.bind(analytics),
    dealPrint: analytics.dealPrint.bind(analytics),
    dealShare: analytics.dealShare.bind(analytics),
    dealFavorite: analytics.dealFavorite.bind(analytics),
    search: analytics.searchPerformed.bind(analytics),
    businessView: analytics.businessProfileView.bind(analytics),
    dealCreated: analytics.dealCreated.bind(analytics),
    formStarted: analytics.formStarted.bind(analytics),
    formCompleted: analytics.formCompleted.bind(analytics),
    formAbandoned: analytics.formAbandoned.bind(analytics),
    error: analytics.error.bind(analytics),
    performance: analytics.performance.bind(analytics),
    flush: analytics.flush.bind(analytics),
  };
}