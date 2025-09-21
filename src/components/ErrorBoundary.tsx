import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-6 max-w-md mx-auto p-6">
      <div className="flex justify-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
      </div>

      {error && process.env.NODE_ENV === 'development' && (
        <details className="text-left bg-muted p-4 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium">Error details</summary>
          <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}

      <div className="flex gap-3 justify-center">
        <Button onClick={resetError} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  </div>
);

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}