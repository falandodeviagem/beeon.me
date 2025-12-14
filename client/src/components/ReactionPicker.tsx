import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";

interface ReactionPickerProps {
  postId: number;
  currentReaction?: string | null;
  onReact?: () => void;
}

const REACTIONS = [
  { type: "love", emoji: "❤️", label: "Amei" },
  { type: "like", emoji: "👍", label: "Curti" },
  { type: "laugh", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Uau" },
  { type: "sad", emoji: "😢", label: "Triste" },
  { type: "angry", emoji: "😡", label: "Grr" },
] as const;

export default function ReactionPicker({ postId, currentReaction, onReact }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const reactMutation = trpc.post.react.useMutation({
    onSuccess: () => {
      utils.post.getReactions.invalidate({ postId });
      utils.post.getUserReaction.invalidate({ postId });
      utils.feed.get.invalidate();
      onReact?.();
    },
  });

  const handleReact = (reactionType: string) => {
    reactMutation.mutate({ postId, reactionType: reactionType as any });
    setOpen(false);
  };

  const currentReactionData = REACTIONS.find(r => r.type === currentReaction);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 ${currentReaction ? 'text-primary' : ''}`}
        >
          <span className="text-base">
            {currentReactionData?.emoji || "👍"}
          </span>
          <span className="text-sm">
            {currentReactionData?.label || "Reagir"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReact(reaction.type)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                hover:bg-accent transition-colors
                ${currentReaction === reaction.type ? 'bg-accent' : ''}
              `}
              title={reaction.label}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-xs text-muted-foreground">{reaction.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
