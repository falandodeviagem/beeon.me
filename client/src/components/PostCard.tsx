import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Users } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  };
  onLike?: (postId: number) => void;
  isLiked?: boolean;
}

export default function PostCard({ post, onLike, isLiked = false }: PostCardProps) {
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

      <CardFooter className="pt-0 pb-4">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => onLike?.(post.id)}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {post.likeCount > 0 && <span>{post.likeCount}</span>}
          </Button>

          <Link href={`/community/${post.communityId}?postId=${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              {post.commentCount > 0 && <span>{post.commentCount}</span>}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
