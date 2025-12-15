import { getDb } from './db';
import { posts, users, communities, postHashtags, hashtags } from '../drizzle/schema';
import { eq, and, or, like, gte, lte, desc, sql, inArray } from 'drizzle-orm';

export interface SearchFilters {
  query?: string;
  communityId?: number;
  authorId?: number;
  hashtags?: string[];
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'relevance' | 'date' | 'likes';
  limit?: number;
}

export async function searchPosts(filters: SearchFilters) {
  const db = await getDb();
  if (!db) return [];

  const {
    query,
    communityId,
    authorId,
    hashtags: filterHashtags,
    startDate,
    endDate,
    sortBy = 'date',
    limit = 50,
  } = filters;

  // Build WHERE conditions
  const conditions: any[] = [];

  // Text search in content
  if (query && query.trim()) {
    conditions.push(like(posts.content, `%${query}%`));
  }

  // Community filter
  if (communityId) {
    conditions.push(eq(posts.communityId, communityId));
  }

  // Author filter
  if (authorId) {
    conditions.push(eq(posts.authorId, authorId));
  }

  // Date range filter
  if (startDate) {
    conditions.push(gte(posts.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(posts.createdAt, endDate));
  }

  // Base query
  let query_builder = db
    .select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      communityId: posts.communityId,
      communityName: communities.name,
      likeCount: posts.likeCount,
      commentCount: posts.commentCount,
      shareCount: posts.shareCount,
      isEdited: posts.isEdited,
      editedAt: posts.editedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(communities, eq(posts.communityId, communities.id));

  // Apply WHERE conditions
  if (conditions.length > 0) {
    query_builder = query_builder.where(and(...conditions)) as any;
  }

  // Hashtag filter (requires subquery)
  if (filterHashtags && filterHashtags.length > 0) {
    const hashtagIds = await db
      .select({ id: hashtags.id })
      .from(hashtags)
      .where(
        or(...filterHashtags.map((tag) => eq(hashtags.tag, tag.replace('#', ''))))
      );

    if (hashtagIds.length > 0) {
      const postIds = await db
        .select({ postId: postHashtags.postId })
        .from(postHashtags)
        .where(inArray(postHashtags.hashtagId, hashtagIds.map((h) => h.id)));

      if (postIds.length > 0) {
        query_builder = query_builder.where(
          inArray(posts.id, postIds.map((p) => p.postId))
        ) as any;
      } else {
        // No posts with these hashtags
        return [];
      }
    } else {
      // Hashtags don't exist
      return [];
    }
  }

  // Sorting
  if (sortBy === 'date') {
    query_builder = query_builder.orderBy(desc(posts.createdAt)) as any;
  } else if (sortBy === 'likes') {
    query_builder = query_builder.orderBy(desc(posts.likeCount)) as any;
  }
  // For 'relevance', we could add full-text search scoring later

  // Limit
  query_builder = query_builder.limit(limit) as any;

  return await query_builder;
}

export async function searchUsers(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  if (!query || !query.trim()) return [];

  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      points: users.points,
      level: users.level,
    })
    .from(users)
    .where(
      or(
        like(users.name, `%${query}%`),
        like(users.email, `%${query}%`)
      )
    )
    .orderBy(desc(users.points))
    .limit(limit);
}

export async function searchCommunities(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  if (!query || !query.trim()) return [];

  return await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      imageUrl: communities.imageUrl,
      memberCount: communities.memberCount,
      isPaid: communities.isPaid,
    })
    .from(communities)
    .where(
      or(
        like(communities.name, `%${query}%`),
        like(communities.description, `%${query}%`)
      )
    )
    .orderBy(desc(communities.memberCount))
    .limit(limit);
}

export async function getSearchSuggestions(query: string) {
  const db = await getDb();
  if (!db) return { users: [], communities: [], hashtags: [] };

  if (!query || !query.trim()) {
    // Return trending hashtags when no query
    const trendingHashtags = await db
      .select({
        tag: hashtags.tag,
        count: hashtags.useCount,
      })
      .from(hashtags)
      .orderBy(desc(hashtags.useCount))
      .limit(10);

    return {
      users: [],
      communities: [],
      hashtags: trendingHashtags.map((h) => ({ tag: h.tag, count: h.count })),
    };
  }

  // Search users
  const userResults = await searchUsers(query, 5);

  // Search communities
  const communityResults = await searchCommunities(query, 5);

  // Search hashtags
  const hashtagResults = await db
    .select({
      tag: hashtags.tag,
      count: hashtags.useCount,
    })
    .from(hashtags)
    .where(like(hashtags.tag, `%${query.replace('#', '')}%`))
    .orderBy(desc(hashtags.useCount))
    .limit(5);

  return {
    users: userResults,
    communities: communityResults,
    hashtags: hashtagResults.map((h) => ({ tag: h.tag, count: h.count })),
  };
}
