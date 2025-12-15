import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant: string | null | undefined, title: string | undefined) => {
    const isLoading = title === "Carregando...";
    
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 mt-0.5" />;
    }
    
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-600" />;
      case "destructive":
        return <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />;
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, progress, ...props }) {
        const isLoading = title === "Carregando...";
        const icon = getIcon(variant, title);
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              {icon}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {progress !== undefined && (
                  <Progress value={progress} className="h-2 mt-2" />
                )}
              </div>
            </div>
            {action}
            {!isLoading && <ToastClose />}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
