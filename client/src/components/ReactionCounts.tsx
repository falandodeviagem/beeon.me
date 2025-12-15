import { trpc } from "@/lib/trpc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReactionCountsProps {
  postId: number;
}

const REACTION_EMOJIS: Record<string, string> = {
  love: "❤️",
  like: "👍",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export default function ReactionCounts({ postId }: ReactionCountsProps) {
  const { data: reactions = {} } = trpc.reactions.getCounts.useQuery({ postId });
  const { data: users } = trpc.reactions.getUsers.useQuery({ postId });

  const totalReactions = Object.values(reactions).reduce((sum: number, count) => sum + (count as number), 0);

  if (totalReactions === 0) return null;

  // Get top 3 reactions
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => (count as number) > 0)
    .sort(([_, a], [__, b]) => (b as number) - (a as number))
    .slice(0, 3);

  // Group users by reaction type
  const usersByReaction: Record<string, typeof users> = {};
  users?.forEach((user) => {
    if (!usersByReaction[user.reactionType]) {
      usersByReaction[user.reactionType] = [];
    }
    usersByReaction[user.reactionType]!.push(user);
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-sm cursor-pointer hover:text-foreground transition-colors">
            <div className="flex -space-x-1">
              {topReactions.map(([type]) => (
                <span
                  key={type}
                  className="inline-flex items-center justify-center w-5 h-5 bg-background rounded-full border border-border text-xs"
                >
                  {REACTION_EMOJIS[type]}
                </span>
              ))}
            </div>
            <span className="text-muted-foreground ml-1">
              {totalReactions}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-3">
            {Object.entries(usersByReaction).map(([reactionType, reactionUsers]) => (
              <div key={reactionType}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{REACTION_EMOJIS[reactionType]}</span>
                  <span className="text-sm font-medium">
                    {reactions[reactionType]} {reactions[reactionType] === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reactionUsers?.slice(0, 10).map((user) => (
                    <div key={user.userId} className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={user.userAvatar || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {user.userName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{user.userName || 'Usuário'}</span>
                    </div>
                  ))}
                  {reactionUsers && reactionUsers.length > 10 && (
                    <span className="text-xs text-muted-foreground">
                      +{reactionUsers.length - 10} mais
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
