import { trpc } from "@/lib/trpc";

interface OnlineIndicatorProps {
  userId: number;
  className?: string;
}

export function OnlineIndicator({ userId, className = "" }: OnlineIndicatorProps) {
  const { data: onlineUsers = [] } = trpc.messages.onlineUsers.useQuery(
    { userIds: [userId] },
    { refetchInterval: 10000 } // Check every 10 seconds
  );

  const isOnline = onlineUsers.includes(userId);

  if (!isOnline) return null;

  return (
    <div 
      className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background ${className}`}
      title="Online"
    />
  );
}
