import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Lock, Heart, MessageCircle, Send, MoreVertical, Flag } from "lucide-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/community/:id");
  const communityId = params?.id ? parseInt(params.id) : 0;

  const [postContent, setPostContent] = useState("");
  const [commentContent, setCommentContent] = useState<Record<number, string>>({});

  const { data: community, isLoading: communityLoading } = trpc.community.getById.useQuery(
    { id: communityId },
    { enabled: communityId > 0 }
  );

  const { data: isMember } = trpc.community.isMember.useQuery(
    { communityId },
    { enabled: communityId > 0 && isAuthenticated }
  );

  const { data: posts, isLoading: postsLoading } = trpc.post.list.useQuery(
    { communityId },
    { enabled: communityId > 0 }
  );

  const utils = trpc.useUtils();

  const joinMutation = trpc.community.join.useMutation({
    onSuccess: () => {
      toast.success("Você entrou na comunidade!");
      utils.community.isMember.invalidate();
      utils.community.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao entrar na comunidade");
    },
  });

  const leaveMutation = trpc.community.leave.useMutation({
    onSuccess: () => {
      toast.success("Você saiu da comunidade");
      utils.community.isMember.invalidate();
      utils.community.getById.invalidate();
    },
  });

  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      toast.success("Post criado!");
      setPostContent("");
      utils.post.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar post");
    },
  });

  const likeMutation = trpc.post.like.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
    },
  });

  const createCommentMutation = trpc.comment.create.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Comentário adicionado!");
      setCommentContent((prev) => ({ ...prev, [variables.postId]: "" }));
      utils.comment.list.invalidate();
    },
  });

  const reportMutation = trpc.moderation.report.useMutation({
    onSuccess: () => {
      toast.success("Denúncia enviada para análise");
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (communityLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </MainLayout>
    );
  }

  if (!community) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Comunidade não encontrada</h2>
          <Button onClick={() => window.history.back()}>Voltar</Button>
        </div>
      </MainLayout>
    );
  }

  const createCheckoutMutation = trpc.community.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar checkout");
    },
  });

  const handleJoin = () => {
    if (community.isPaid) {
      createCheckoutMutation.mutate({
        communityId,
        successUrl: `${window.location.origin}/community/${communityId}?success=true`,
        cancelUrl: `${window.location.origin}/community/${communityId}`,
      });
    } else {
      joinMutation.mutate({ communityId });
    }
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      toast.error("Escreva algo antes de postar");
      return;
    }
    createPostMutation.mutate({
      communityId,
      content: postContent,
    });
  };

  const handleLike = (postId: number) => {
    likeMutation.mutate({ postId });
  };

  const handleComment = (postId: number) => {
    const content = commentContent[postId];
    if (!content?.trim()) {
      toast.error("Escreva um comentário");
      return;
    }
    createCommentMutation.mutate({
      postId,
      content,
    });
  };

  const handleReport = (type: "post" | "comment", targetId: number) => {
    reportMutation.mutate({
      reportType: type,
      targetId,
      reason: "Conteúdo inapropriado",
    });
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Community Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{community.name}</h1>
                  {community.isPaid ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Paga
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pública</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{community.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount} membros</span>
                  </div>
                </div>
              </div>

              <div>
                {isMember ? (
                  <Button variant="outline" onClick={() => leaveMutation.mutate({ communityId })}>
                    Sair da Comunidade
                  </Button>
                ) : (
                  <Button onClick={handleJoin} disabled={joinMutation.isPending}>
                    {community.isPaid
                      ? `Assinar por R$ ${(community.price / 100).toFixed(2)}/mês`
                      : "Entrar na Comunidade"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Create Post */}
        {isMember && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Textarea
                placeholder="Compartilhe algo com a comunidade..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {postsLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Usuário #{post.authorId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleReport("post", post.id)}>
                          <Flag className="w-4 h-4 mr-2" />
                          Denunciar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                  <Separator />

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className="w-4 h-4" />
                      {post.likeCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post.commentCount}
                    </Button>
                  </div>

                  {/* Comment Input */}
                  {isMember && (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Escreva um comentário..."
                        value={commentContent[post.id] || ""}
                        onChange={(e) =>
                          setCommentContent((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        rows={2}
                        className="flex-1"
                      />
                      <Button onClick={() => handleComment(post.id)} size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isMember
                    ? "Nenhum post ainda. Seja o primeiro a postar!"
                    : "Entre na comunidade para ver os posts"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
