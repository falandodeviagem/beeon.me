import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";

export function FeedFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filtros:</span>
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
    </div>
  );
}
