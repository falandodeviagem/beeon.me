import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
}

/**
 * Hook for infinite scroll functionality
 * 
 * Detects when user scrolls near the bottom of the page
 * and triggers onLoadMore callback to fetch more data
 * 
 * @param options Configuration options
 * @param options.onLoadMore Callback to fetch more data
 * @param options.hasMore Whether there's more data to load
 * @param options.isLoading Whether data is currently loading
 * @param options.threshold Distance from bottom to trigger load (default: 300px)
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel);
      }
    };
  }, [handleObserver, threshold]);

  return sentinelRef;
}
