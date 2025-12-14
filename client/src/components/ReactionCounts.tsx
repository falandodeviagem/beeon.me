import { trpc } from "@/lib/trpc";

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
  const { data: reactions = {} } = trpc.post.getReactions.useQuery({ postId });

  const totalReactions = Object.values(reactions).reduce((sum: number, count) => sum + (count as number), 0);

  if (totalReactions === 0) return null;

  // Get top 3 reactions
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => (count as number) > 0)
    .sort(([_, a], [__, b]) => (b as number) - (a as number))
    .slice(0, 3);

  return (
    <div className="flex items-center gap-1 text-sm">
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
  );
}
