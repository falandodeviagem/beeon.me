import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Flame, TrendingUp, Users, Hash } from "lucide-react";
import { Link } from "wouter";

export default function TrendingTopics() {
  const { data: trendingCommunities = [] } = trpc.trending.communities.useQuery({ limit: 5 });
  const { data: trendingPosts = [] } = trpc.trending.posts.useQuery({ limit: 3 });
  const { data: trendingHashtags = [] } = trpc.hashtags.trending.useQuery({ limit: 10 });

  return (
    <div className="space-y-4">
      {/* Comunidades em Alta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Comunidades em Alta
          </CardTitle>
          <CardDescription>Mais ativas nos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {trendingCommunities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma comunidade ativa ainda
            </p>
          ) : (
            <div className="space-y-3">
              {trendingCommunities.map((community, index) => (
                <div key={community.id}>
                  <Link href={`/community/${community.id}`}>
                    <div className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                      {community.imageUrl && (
                        <img
                          src={community.imageUrl}
                          alt={community.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{community.name}</h4>
                          {community.isPaid && (
                            <Badge variant="default" className="text-xs">Paga</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {community.memberCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {community.recentPostCount} posts
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {index < trendingCommunities.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="w-5 h-5 text-amber-500" />
            Hashtags em Alta
          </CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {trendingHashtags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma hashtag ainda
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((hashtag) => (
                <Link key={hashtag.id} href={`/hashtag/${hashtag.tag}`}>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    #{hashtag.tag} ({hashtag.postCount})
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-red-500" />
            Posts Populares
          </CardTitle>
          <CardDescription>Mais reagidos nas últimas 24h</CardDescription>
        </CardHeader>
        <CardContent>
          {trendingPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum post popular ainda
            </p>
          ) : (
            <div className="space-y-3">
              {trendingPosts.map((post, index) => (
                <div key={post.id}>
                  <Link href={`/community/${post.communityId}?postId=${post.id}`}>
                    <div className="cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.communityName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          por {post.authorName}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.reactionCount} reações</span>
                        <span>{post.commentCount} comentários</span>
                      </div>
                    </div>
                  </Link>
                  {index < trendingPosts.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
