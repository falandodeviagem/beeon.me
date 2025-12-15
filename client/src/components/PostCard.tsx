import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Share2, Check, Edit2 } from "lucide-react";
import ReactionPicker from "@/components/ReactionPicker";
import ReactionCounts from "@/components/ReactionCounts";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import HashtagText from "@/components/HashtagText";
import { PostContent } from "@/components/PostContent";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    imageUrl: string | null;
    createdAt: Date;
    authorId: number;
    authorName: string | null;
    authorAvatar: string | null;
    communityId: number;
    communityName: string;
    likeCount: number;
    commentCount: number;
    shareCount?: number;
    isEdited?: boolean;
    editedAt?: Date | null;
  };
  onLike?: (postId: number) => void;
  isLiked?: boolean;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [copied, setCopied] = useState(false);
  const { data: currentReaction } = trpc.post.getUserReaction.useQuery({ postId: post.id });
  const shareMutation = trpc.post.share.useMutation({
    onSuccess: () => {
      toast.success("Post compartilhado!");
    },
  });
  
  const editMutation = trpc.post.edit.useMutation({
    onSuccess: () => {
      toast.success("Post editado com sucesso!");
      setShowEditDialog(false);
      window.location.reload(); // Refresh to show edited content
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao editar post");
    },
  });
  
  const handleEdit = () => {
    if (editContent.trim() === post.content) {
      setShowEditDialog(false);
      return;
    }
    editMutation.mutate({ postId: post.id, content: editContent });
  };
  
  const isAuthor = user?.id === post.authorId;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile?userId=${post.authorId}`}>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={post.authorAvatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {post.authorName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile?userId=${post.authorId}`}>
                <p className="font-semibold hover:underline cursor-pointer">
                  {post.authorName}
                </p>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/community/${post.communityId}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 gap-1">
                    <Users className="w-3 h-3" />
                    {post.communityName}
                  </Badge>
                </Link>
                <span>•</span>
                <span>{timeAgo}</span>
                {post.isEdited && post.editedAt && (
                  <>
                    <span>•</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs italic cursor-help">(editado)</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editado {formatDistanceToNow(new Date(post.editedAt), { addSuffix: true, locale: ptBR })}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <PostContent content={post.content} className="text-foreground" />
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="mt-4 rounded-lg w-full object-cover max-h-96"
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-3 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ReactionPicker postId={post.id} currentReaction={currentReaction} />
            <ReactionCounts postId={post.id} />
          </div>

          <div className="flex items-center gap-1">
            <Link href={`/community/${post.communityId}?postId=${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {post.commentCount > 0 && <span>{post.commentCount}</span>}
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setShowShareDialog(true);
                shareMutation.mutate({ postId: post.id });
              }}
            >
              <Share2 className="w-4 h-4" />
              {(post.shareCount || 0) > 0 && <span>{post.shareCount}</span>}
            </Button>
            
            {isAuthor && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copie o link abaixo para compartilhar este post:
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/community/${post.communityId}?postId=${post.id}`}
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/community/${post.communityId}?postId=${post.id}`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success("Link copiado!");
                }}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : "Copiar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="O que você está pensando?"
              className="min-h-32"
              maxLength={5000}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleEdit}
                disabled={editMutation.isPending || !editContent.trim()}
              >
                {editMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
