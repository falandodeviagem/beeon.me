import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { CommentItem } from "@/components/CommentItem";
import { MentionInput } from "@/components/MentionInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export default function PostView() {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id ? parseInt(params.id) : 0;
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");

  const { data: post, isLoading: postLoading } = trpc.post.getById.useQuery(
    { id: postId },
    { enabled: postId > 0 }
  );

  const { data: comments = [], refetch: refetchComments } = trpc.comment.list.useQuery(
    { postId },
    { enabled: postId > 0 }
  );

  const createCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast.success("Comentário adicionado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar comentário");
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      postId,
      content: newComment,
    });
  };

  if (postLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <Skeleton className="h-96 mb-6" />
          <Skeleton className="h-48" />
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-2">Post não encontrado</h2>
              <p className="text-muted-foreground">
                O post que você está procurando não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Post */}
        <PostCard post={{ ...post, communityName: post.communityName || 'Sem comunidade' }} />

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comentários ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <MentionInput
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Adicione um comentário... (use @ para mencionar)"
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Faça login para comentar
              </p>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4 mt-6">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onDeleted={refetchComments}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
