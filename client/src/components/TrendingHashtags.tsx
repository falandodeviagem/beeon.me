import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { TrendingUp, Hash } from "lucide-react";

interface TrendingHashtagsProps {
  limit?: number;
  className?: string;
}

export default function TrendingHashtags({ limit = 10, className = "" }: TrendingHashtagsProps) {
  const { data: hashtags, isLoading } = trpc.hashtags.trending.useQuery({ limit });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Hashtags em Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hashtags || hashtags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Hashtags em Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma hashtag em alta</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Hashtags em Alta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {hashtags.map((hashtag, index) => (
            <Link key={hashtag.id} href={`/hashtag/${encodeURIComponent(hashtag.tag)}`}>
              <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-accent cursor-pointer group">
                <span className={`text-sm font-medium w-5 text-center ${
                  index < 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">
                    #{hashtag.tag}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {hashtag.postCount || hashtag.useCount} {(hashtag.postCount || hashtag.useCount) === 1 ? 'post' : 'posts'}
                  </p>
                </div>
                {index < 3 && (
                  <Badge variant="secondary" className="text-xs px-1.5">
                    🔥
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
