import { useState, useEffect } from 'react';

// PWA Installation utilities
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

class PWAInstaller {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if app is already installed
    this.checkInstallationStatus();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.emit('caninstall', true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.emit('installed', true);
    });

    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      this.emit('installed', true);
    }
  }

  private checkInstallationStatus() {
    // Check various indicators of PWA installation
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    this.isInstalled = isStandalone || (isIOS && isInWebAppiOS);
  }

  // Check if installation is available
  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  // Check if app is installed
  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Trigger installation prompt
  async install(): Promise<'accepted' | 'dismissed' | 'not-available'> {
    if (!this.canInstall()) {
      return 'not-available';
    }

    try {
      await this.deferredPrompt!.prompt();
      const { outcome } = await this.deferredPrompt!.userChoice;
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this.emit('installprompt', 'accepted');
      } else {
        this.emit('installprompt', 'dismissed');
      }
      
      return outcome;
    } catch (error) {
      console.error('PWA installation error:', error);
      return 'not-available';
    }
  }

  // Get installation instructions for different platforms
  getInstallInstructions(): { platform: string; instructions: string[] } {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        platform: 'Chrome',
        instructions: [
          'Click the install button in the address bar',
          'Or use the menu (⋮) > Install Easy Execute',
          'The app will be added to your home screen and apps menu'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        platform: 'Firefox',
        instructions: [
          'Click the install icon in the address bar',
          'Or use the menu (☰) > Install this site as an app',
          'The app will be available in your applications'
        ]
      };
    } else if (userAgent.includes('safari')) {
      return {
        platform: 'Safari',
        instructions: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      };
    } else if (userAgent.includes('edg')) {
      return {
        platform: 'Edge',
        instructions: [
          'Click the install button in the address bar',
          'Or use the menu (⋯) > Apps > Install this site as an app',
          'The app will be added to your Start menu and taskbar'
        ]
      };
    }

    return {
      platform: 'Browser',
      instructions: [
        'Look for an install or "Add to Home Screen" option in your browser',
        'This may be in the browser menu or address bar',
        'Follow your browser\'s installation prompts'
      ]
    };
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
}

// Singleton instance
export const pwaInstaller = new PWAInstaller();

// React hook for PWA installation
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(pwaInstaller.canInstall());
  const [isInstalled, setIsInstalled] = useState(pwaInstaller.isAppInstalled());
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleCanInstall = (available: boolean) => setCanInstall(available);
    const handleInstalled = (installed: boolean) => setIsInstalled(installed);

    pwaInstaller.on('caninstall', handleCanInstall);
    pwaInstaller.on('installed', handleInstalled);

    return () => {
      pwaInstaller.off('caninstall', handleCanInstall);
      pwaInstaller.off('installed', handleInstalled);
    };
  }, []);

  const install = async () => {
    setIsInstalling(true);
    try {
      const result = await pwaInstaller.install();
      return result;
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    canInstall,
    isInstalled,
    isInstalling,
    install,
    getInstructions: pwaInstaller.getInstallInstructions.bind(pwaInstaller),
  };
}