import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    // Show banner after 30 seconds if installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !isDismissed) {
        setShowBanner(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isInstallable]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isInstallable || dismissed || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-card/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🐝</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Instalar BeeOn.me
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Acesse mais rápido e receba notificações mesmo offline!
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 flex-shrink-0"
            onClick={handleDismiss}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
