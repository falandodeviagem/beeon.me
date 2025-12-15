import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Offline Indicator Component
 * 
 * Shows a banner at the top when user goes offline
 * Automatically hides when connection is restored
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "Back online" message briefly
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-medium animate-in slide-in-from-top duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-yellow-950'
      }`}
    >
      <div className="container flex items-center justify-center gap-2">
        {!isOnline && <WifiOff className="w-4 h-4" />}
        <span>
          {isOnline
            ? '✓ Você está online novamente'
            : 'Você está offline. Alguns recursos podem estar limitados.'}
        </span>
      </div>
    </div>
  );
}
