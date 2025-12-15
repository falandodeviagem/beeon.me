import { getDb } from "./db";
import { postReactions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getPostReactionUsers(postId: number, reactionType: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      userId: users.id,
      userName: users.name,
      userAvatar: users.avatarUrl,
      reactionType: postReactions.reactionType,
    })
    .from(postReactions)
    .innerJoin(users, eq(postReactions.userId, users.id))
    .where(eq(postReactions.postId, postId));

  return result;
}
