import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface FollowButtonProps {
  userId: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export default function FollowButton({ userId, variant = "default", size = "default" }: FollowButtonProps) {
  const { user: currentUser } = useAuth();
  const { data: isFollowing = false } = trpc.follow.isFollowing.useQuery(
    { userId },
    { enabled: !!currentUser && currentUser.id !== userId }
  );

  const utils = trpc.useUtils();
  const followMutation = trpc.follow.follow.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId });
      utils.follow.followerCount.invalidate({ userId });
    },
  });

  const unfollowMutation = trpc.follow.unfollow.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId });
      utils.follow.followerCount.invalidate({ userId });
    },
  });

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ userId });
    } else {
      followMutation.mutate({ userId });
    }
  };

  if (!currentUser || currentUser.id === userId) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      variant={isFollowing ? "outline" : variant}
      size={size}
      disabled={followMutation.isPending || unfollowMutation.isPending}
    >
      {isFollowing ? "Deixar de Seguir" : "Seguir"}
    </Button>
  );
}
