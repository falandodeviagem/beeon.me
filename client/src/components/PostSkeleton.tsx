import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for post cards
 * Shows placeholder UI while posts are loading
 */
export function PostSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          
          <div className="flex-1 space-y-2">
            {/* Author name skeleton */}
            <Skeleton className="h-4 w-32" />
            {/* Timestamp skeleton */}
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Content skeleton - 3 lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        
        {/* Image skeleton (optional, 50% chance) */}
        {Math.random() > 0.5 && (
          <Skeleton className="h-64 w-full rounded-lg mt-3" />
        )}
      </CardContent>
      
      <CardFooter>
        <div className="flex items-center gap-4 w-full">
          {/* Reaction button skeleton */}
          <Skeleton className="h-9 w-16" />
          {/* Comment button skeleton */}
          <Skeleton className="h-9 w-16" />
          {/* Share button skeleton */}
          <Skeleton className="h-9 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Multiple post skeletons for initial loading
 */
export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
