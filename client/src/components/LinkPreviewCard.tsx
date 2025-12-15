import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

interface LinkPreviewCardProps {
  url: string;
}

export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const [shouldFetch, setShouldFetch] = useState(false);

  // Delay fetching to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => setShouldFetch(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: preview, isLoading } = trpc.linkPreview.fetch.useQuery(
    { url },
    { enabled: shouldFetch, retry: false, staleTime: Infinity }
  );

  if (!shouldFetch || isLoading) {
    return (
      <Card className="mt-2 border-muted">
        <CardContent className="p-3 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Carregando preview...</span>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 no-underline"
    >
      <Card className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer border-muted">
        <CardContent className="p-0">
          <div className="flex gap-3">
            {preview.image && (
              <div className="w-32 h-32 flex-shrink-0 bg-muted">
                <img
                  src={preview.image}
                  alt={preview.title || 'Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-3 min-w-0">
              {preview.siteName && (
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {preview.siteName}
                </p>
              )}
              {preview.title && (
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                  {preview.title}
                </h4>
              )}
              {preview.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {preview.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-primary">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{new URL(url).hostname}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
