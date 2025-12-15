import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, Loader2, TrendingUp, ArrowLeft } from "lucide-react";

export default function HashtagPage() {
  const params = useParams();
  const tag = params.tag || "";

  const { data: posts, isLoading } = trpc.hashtags.byTag.useQuery({ tag, limit: 50 });
  const { data: trendingHashtags } = trpc.hashtags.trending.useQuery({ limit: 10 });

  return (
    <MainLayout>
      <div className="container max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Link href="/">
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">#{tag}</CardTitle>
                    <p className="text-muted-foreground">
                      {posts?.length || 0} {(posts?.length || 0) === 1 ? "post" : "posts"} com esta hashtag
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Posts */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && posts && posts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Hash className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
                  <p className="text-muted-foreground">
                    Ainda não há posts com esta hashtag. Seja o primeiro a usá-la!
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && posts && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Hashtags em Alta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendingHashtags && trendingHashtags.length > 0 ? (
                  <div className="space-y-2">
                    {trendingHashtags.map((hashtag, index) => (
                      <Link key={hashtag.id} href={`/hashtag/${encodeURIComponent(hashtag.tag)}`}>
                        <div className={`flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-accent cursor-pointer ${
                          hashtag.tag.toLowerCase() === tag.toLowerCase() ? 'bg-accent' : ''
                        }`}>
                          <span className="text-muted-foreground text-sm w-4">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium">#{hashtag.tag}</span>
                            <p className="text-xs text-muted-foreground">
                              {hashtag.postCount || hashtag.useCount} posts
                            </p>
                          </div>
                          {index < 3 && (
                            <Badge variant="secondary" className="text-xs">
                              🔥
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma hashtag em alta no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
