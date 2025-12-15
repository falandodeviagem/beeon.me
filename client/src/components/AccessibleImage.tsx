import { ImgHTMLAttributes, useState } from "react";

interface AccessibleImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

/**
 * Accessible image component with proper alt text and error handling
 * 
 * Features:
 * - Enforces alt text requirement
 * - Handles image load errors with fallback
 * - Maintains aspect ratio
 * - Supports all standard img attributes
 */
export function AccessibleImage({ 
  src, 
  alt, 
  fallback,
  className = "",
  ...props 
}: AccessibleImageProps) {
  const [error, setError] = useState(false);

  if (error && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
