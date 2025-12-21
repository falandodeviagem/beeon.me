import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Award, Calendar, MessageCircle, ThumbsUp, Trophy, Users } from "lucide-react";
import { BadgeGrid } from "@/components/BadgeGrid";
import { useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const parsedUserId = parseInt(userId || "0");

  const { data: user, isLoading: userLoading } = trpc.profile.getUser.useQuery({ userId: parsedUserId });
  const { data: posts = [], isLoading: postsLoading } = trpc.profile.posts.useQuery({ userId: parsedUserId });
  const { data: badges = [], isLoading: badgesLoading } = trpc.profile.badges.useQuery({ userId: parsedUserId });
  const { data: communities = [], isLoading: communitiesLoading } = trpc.profile.communities.useQuery({ userId: parsedUserId });
  const { data: stats } = trpc.profile.stats.useQuery({ userId: parsedUserId });
  const { data: followerCount = 0 } = trpc.follow.followerCount.useQuery({ userId: parsedUserId });
  const { data: followingCount = 0 } = trpc.follow.followingCount.useQuery({ userId: parsedUserId });
  const { data: isFollowing = false } = trpc.follow.isFollowing.useQuery(
    { userId: parsedUserId },
    { enabled: !!currentUser && currentUser.id !== parsedUserId }
  );

  const utils = trpc.useUtils();
  const followMutation = trpc.follow.follow.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId: parsedUserId });
      utils.follow.followerCount.invalidate({ userId: parsedUserId });
    },
  });

  const unfollowMutation = trpc.follow.unfollow.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId: parsedUserId });
      utils.follow.followerCount.invalidate({ userId: parsedUserId });
    },
  });

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ userId: parsedUserId });
    } else {
      followMutation.mutate({ userId: parsedUserId });
    }
  };

  if (userLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Usuário não encontrado</h2>
          <p className="text-muted-foreground">Este perfil não existe ou foi removido.</p>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = currentUser?.id === parsedUserId;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header do Perfil */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold">{user.name || "Usuário Anônimo"}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  {!isOwnProfile && currentUser && (
                    <Button
                      onClick={handleFollowToggle}
                      variant={isFollowing ? "outline" : "default"}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {isFollowing ? "Deixar de Seguir" : "Seguir"}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Link href="/profile">
                      <Button variant="outline">Editar Perfil</Button>
                    </Link>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm mb-4">{user.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">{user.points || 0}</span>
                    <span className="text-muted-foreground">pontos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold">Nível {user.level || 1}</span>
                  </div>
                  <Link href={`/user/${parsedUserId}/followers`}>
                    <div className="flex items-center gap-2 hover:underline cursor-pointer">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{followerCount}</span>
                      <span className="text-muted-foreground">seguidores</span>
                    </div>
                  </Link>
                  <Link href={`/user/${parsedUserId}/following`}>
                    <div className="flex items-center gap-2 hover:underline cursor-pointer">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{followingCount}</span>
                      <span className="text-muted-foreground">seguindo</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">{stats?.postCount || 0}</span>
                    <span className="text-muted-foreground">posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-pink-500" />
                    <span className="font-semibold">{stats?.commentCount || 0}</span>
                    <span className="text-muted-foreground">comentários</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="communities">Comunidades</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum post ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Link href={`/community/${post.communityId}`}>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                            {post.communityName}
                          </Badge>
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="mt-4 rounded-lg w-full object-cover max-h-96"
                        />
                      )}
                      <Separator className="my-4" />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.likeCount} reações</span>
                        <span>{post.commentCount} comentários</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            {badgesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <BadgeGrid badges={badges} />
            )}
          </TabsContent>

          <TabsContent value="communities" className="mt-6">
            {communitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : communities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Não participa de nenhuma comunidade ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((community) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          {community.imageUrl && (
                            <img
                              src={community.imageUrl}
                              alt={community.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{community.name}</CardTitle>
                              {community.isPaid && (
                                <Badge variant="default" className="text-xs">Paga</Badge>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {community.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.memberCount} membros
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Membro
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
