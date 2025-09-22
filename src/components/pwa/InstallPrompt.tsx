import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '@/lib/pwa/installHook';

interface InstallPromptProps {
  show?: boolean;
  onClose?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
}

export function InstallPrompt({ 
  show = true, 
  onClose, 
  variant = 'banner' 
}: InstallPromptProps) {
  const { canInstall, isInstalled, isInstalling, install, getInstructions } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [installResult, setInstallResult] = useState<string | null>(null);

  const handleInstall = async () => {
    const result = await install();
    setInstallResult(result);
    
    if (result === 'accepted') {
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
  };

  const instructions = getInstructions();

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show banner if can't install and no manual instructions needed
  if (variant === 'banner' && !canInstall && !show) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Install Easy Execute</h3>
          <p className="text-muted-foreground text-sm">
            Get quick access to deals with our mobile app experience
          </p>
        </div>
        {variant === 'banner' && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Faster loading</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Offline access</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Push notifications</span>
        </div>
      </div>

      {/* Install Status */}
      {installResult && (
        <div className="p-3 rounded-lg bg-muted">
          {installResult === 'accepted' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Successfully installed! Check your home screen.</span>
            </div>
          )}
          {installResult === 'dismissed' && (
            <div className="flex items-center gap-2 text-amber-600">
              <Info className="h-4 w-4" />
              <span className="text-sm">Installation cancelled. You can install anytime from the browser menu.</span>
            </div>
          )}
          {installResult === 'not-available' && (
            <div className="flex items-center gap-2 text-blue-600">
              <Info className="h-4 w-4" />
              <span className="text-sm">Use your browser's install option or see manual instructions below.</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canInstall && (
          <Button onClick={handleInstall} disabled={isInstalling}>
            <Download className="h-4 w-4 mr-2" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <Info className="h-4 w-4 mr-2" />
          Manual Install
        </Button>
      </div>

      {/* Manual Instructions */}
      {showInstructions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Install on {instructions.platform}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {instructions.instructions.map((instruction, index) => (
                <li key={index} className="text-muted-foreground">
                  {instruction}
                </li>
              ))}
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Once installed, the app will work offline and load faster!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render based on variant
  if (variant === 'modal') {
    return (
      <Dialog open={show} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Install App</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'inline') {
    return (
      <Card>
        <CardContent className="p-6">
          {content}
        </CardContent>
      </Card>
    );
  }

  // Banner variant
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to show install prompt conditionally
export function useInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const { canInstall, isInstalled } = usePWAInstall();

  React.useEffect(() => {
    // Show prompt after 30 seconds if can install and haven't shown before
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !hasShownPrompt) {
        const lastShown = localStorage.getItem('pwa-install-prompt-shown');
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        
        if (!lastShown || parseInt(lastShown) < oneDayAgo) {
          setShowPrompt(true);
        }
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, hasShownPrompt]);

  const hidePrompt = () => {
    setShowPrompt(false);
    setHasShownPrompt(true);
    localStorage.setItem('pwa-install-prompt-shown', Date.now().toString());
  };

  return {
    showPrompt,
    hidePrompt,
    canShowPrompt: canInstall && !isInstalled,
  };
}