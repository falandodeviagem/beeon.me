import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Share2, Check } from "lucide-react";
import ReactionPicker from "@/components/ReactionPicker";
import ReactionCounts from "@/components/ReactionCounts";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  };
  onLike?: (postId: number) => void;
  isLiked?: boolean;
}

export default function PostCard({ post }: PostCardProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: currentReaction } = trpc.post.getUserReaction.useQuery({ postId: post.id });
  const shareMutation = trpc.post.share.useMutation({
    onSuccess: () => {
      toast.success("Post compartilhado!");
    },
  });
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
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
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
    </Card>
  );
}
