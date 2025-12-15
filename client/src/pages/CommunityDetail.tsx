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
import { useToast } from "@/hooks/use-toast";
import { Users, Lock, Heart, MessageCircle, Send, MoreVertical, Flag, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { MentionInput } from "@/components/MentionInput";
import { MentionText } from "@/components/MentionText";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextDisplay } from "@/components/RichTextDisplay";
import { PostContent } from "@/components/PostContent";
import { useRoute, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PromotedCommunitiesWidget } from "@/components/PromotedCommunitiesWidget";
import { ManagePromotions } from "@/components/ManagePromotions";
import { Settings, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const { loading, update, toast, promise } = useToast();

  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
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
      toast({
        title: "Sucesso!",
        description: "Você entrou na comunidade",
        variant: "success",
      });
      utils.community.isMember.invalidate();
      utils.community.getById.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao entrar na comunidade",
        variant: "destructive",
      });
    },
  });

  const leaveMutation = trpc.community.leave.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Você saiu da comunidade",
        variant: "success",
      });
      utils.community.isMember.invalidate();
      utils.community.getById.invalidate();
    },
  });

  const createPostMutation = trpc.post.create.useMutation();
  
  const handleCreatePost = async () => {
    if (!postContent.trim() && postImages.length === 0) return;
    
    try {
      await promise(
        createPostMutation.mutateAsync({
          communityId,
          content: postContent,
          imageUrls: postImages,
        }),
        {
          loading: "Criando post...",
          success: "Post criado com sucesso!",
          error: (err) => err.message || "Erro ao criar post",
        }
      );
      
      setPostContent("");
      setPostImages([]);
      utils.post.list.invalidate();
    } catch (error) {
      // Error already handled by toast.promise()
    }
  };

  const likeMutation = trpc.post.like.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
    },
  });

  const createCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Comentário criado",
        variant: "success",
      });
      utils.post.list.invalidate();
    },
  });
  
  const deletePostMutation = trpc.post.delete.useMutation();

  const reportMutation = trpc.moderation.report.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Denúncia enviada para análise",
        variant: "success",
      });
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
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar checkout",
        variant: "destructive",
      });
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



  const handleLike = (postId: number) => {
    likeMutation.mutate({ postId });
  };

  const handleComment = (postId: number) => {
    const content = commentContent[postId];
    if (!content?.trim()) {
      toast({
        title: "Erro",
        description: "Escreva um comentário",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate({
      postId,
      content,
    });
  };

  const handleReport = (type: "post" | "comment", id: number) => {
    reportMutation.mutate({ reportType: type, targetId: id, reason: "Conteúdo inapropriado" });
  };
  
  const handleDeletePost = (postId: number) => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    let cancelled = false;
    let remainingTime = 5;
    
    const toastId = toast({
      title: "Post deletado",
      description: "O post será removido em 5 segundos",
      variant: "warning",
      progress: 100,
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            cancelled = true;
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            toast({
              title: "Cancelado",
              description: "A deleção foi cancelada",
              variant: "success",
            });
          }}
        >
          Desfazer
        </Button>
      ),
    });
    
    // Update progress bar every second
    intervalId = setInterval(() => {
      remainingTime -= 1;
      const progressPercent = (remainingTime / 5) * 100;
      update(toastId.id, {
        progress: progressPercent,
        description: `O post será removido em ${remainingTime} segundo${remainingTime !== 1 ? 's' : ''}`,
      });
      
      if (remainingTime <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);
    
    timeoutId = setTimeout(async () => {
      if (!cancelled) {
        clearInterval(intervalId);
        try {
          await deletePostMutation.mutateAsync({ id: postId });
          update(toastId.id, {
            title: "Sucesso!",
            description: "Post deletado permanentemente",
            variant: "success",
            progress: undefined,
          });
          utils.post.list.invalidate();
        } catch (error: any) {
          update(toastId.id, {
            title: "Erro",
            description: error.message || "Erro ao deletar post",
            variant: "destructive",
            progress: undefined,
          });
        }
      }
    }, 5000);
  };

  const isOwner = user?.id === community.ownerId;

  return (
    <MainLayout>
      <div className="container max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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

              <div className="flex gap-2">
                {isOwner && (
                  <>
                    <Link href={`/community/${communityId}/stats`}>
                      <a>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Estatísticas
                        </Button>
                      </a>
                    </Link>
                    <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar Promoções
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Gerenciar Comunidades Promovidas</DialogTitle>
                        <DialogDescription>
                          Selecione até 6 comunidades para exibir como recomendações
                        </DialogDescription>
                      </DialogHeader>
                      <ManagePromotions communityId={communityId} />
                    </DialogContent>
                  </Dialog>
                  </>
                )}
                
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
              <RichTextEditor
                placeholder="Compartilhe algo com a comunidade... Use a barra de ferramentas para formatar"
                value={postContent}
                onChange={setPostContent}
                className="w-full"
              />
              
              <ImageUpload 
                onImagesChange={setPostImages}
                maxImages={5}
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
                        {(user?.id === post.authorId || user?.role === "admin") && (
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-destructive"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleReport("post", post.id)}>
                          <Flag className="w-4 h-4 mr-2" />
                          Denunciar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <PostContent content={post.content} className="text-foreground" />

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
                      <MentionInput
                        placeholder="Escreva um comentário... (use @ para mencionar)"
                        value={commentContent[post.id] || ""}
                        onChange={(value) =>
                          setCommentContent((prev) => ({ ...prev, [post.id]: value }))
                        }
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

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PromotedCommunitiesWidget communityId={communityId} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
