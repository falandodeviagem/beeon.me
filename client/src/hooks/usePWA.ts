import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    toast.info('Nova versão disponível!', {
                      description: 'Recarregue a página para atualizar',
                      action: {
                        label: 'Recarregar',
                        onClick: () => window.location.reload(),
                      },
                    });
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('BeeOn.me instalado com sucesso!');
    });

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Você está online novamente!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    promptInstall,
  };
}
