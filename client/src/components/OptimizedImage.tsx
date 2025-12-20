import { useState, ImgHTMLAttributes } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "auto";
  fallback?: React.ReactNode;
}

/**
 * OptimizedImage - Component with native lazy loading and loading states
 * 
 * Features:
 * - Native lazy loading (loading="lazy")
 * - Automatic skeleton during load
 * - Error fallback
 * - Aspect ratio preservation
 * - Accessibility optimized
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio = "auto",
  fallback,
  className = "",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${aspectRatioClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatioClass}`}>
      {isLoading && (
        <Skeleton className={`absolute inset-0 ${aspectRatioClass}`} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ${className}`}
        {...props}
      />
    </div>
  );
}
