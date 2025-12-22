import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateBadgeProgress } from "./progress";
import * as db from "../db";

// Mock do módulo db
vi.mock("../db", () => ({
  getUserBadges: vi.fn(),
  getUserStats: vi.fn(),
  getUserPosts: vi.fn(),
  getUserCommunities: vi.fn(),
  getAllCommunities: vi.fn(),
  getFollowers: vi.fn(),
  getFollowing: vi.fn(),
}));

describe("calculateBadgeProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate progress for user with no activity", async () => {
    // Mock: usuário sem atividade
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 0, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    expect(progress).toHaveLength(10);
    expect(progress.every((p) => p.percentage === 0)).toBe(true);
    expect(progress.every((p) => !p.isUnlocked)).toBe(true);
  });

  it("should calculate progress for first post badge", async () => {
    // Mock: usuário com 1 post
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 1, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([
      {
        id: 1,
        content: "Test post",
        authorId: 1,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        imageUrl: null,
        visibility: "public",
        communityId: null,
      },
    ]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    const firstPostBadge = progress.find((p) => p.badgeName === "Primeira Postagem");
    expect(firstPostBadge).toBeDefined();
    expect(firstPostBadge?.percentage).toBe(100);
    expect(firstPostBadge?.current).toBe(1);
    expect(firstPostBadge?.required).toBe(1);
  });

  it("should calculate progress for like badges", async () => {
    // Mock: usuário com posts que receberam 50 curtidas
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 2, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([
      {
        id: 1,
        content: "Post 1",
        authorId: 1,
        likeCount: 30,
        commentCount: 0,
        createdAt: new Date(),
        imageUrl: null,
        visibility: "public",
        communityId: null,
      },
      {
        id: 2,
        content: "Post 2",
        authorId: 1,
        likeCount: 20,
        commentCount: 0,
        createdAt: new Date(),
        imageUrl: null,
        visibility: "public",
        communityId: null,
      },
    ]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    const firstLikeBadge = progress.find((p) => p.badgeName === "Primeira Curtida");
    expect(firstLikeBadge?.percentage).toBe(100);

    const hundredLikesBadge = progress.find((p) => p.badgeName === "100 Curtidas");
    expect(hundredLikesBadge?.percentage).toBe(50); // 50/100
    expect(hundredLikesBadge?.current).toBe(50);
    expect(hundredLikesBadge?.required).toBe(100);
  });

  it("should calculate progress for comment badge", async () => {
    // Mock: usuário com 25 comentários
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 0, commentCount: 25 });
    vi.mocked(db.getUserPosts).mockResolvedValue([]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    const commentatorBadge = progress.find((p) => p.badgeName === "Comentarista");
    expect(commentatorBadge?.percentage).toBe(50); // 25/50
    expect(commentatorBadge?.current).toBe(25);
    expect(commentatorBadge?.required).toBe(50);
  });

  it("should calculate progress for social badges", async () => {
    // Mock: usuário seguindo 5 pessoas e com 50 seguidores
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 0, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue(Array(50).fill({ id: 1, name: "User" }));
    vi.mocked(db.getFollowing).mockResolvedValue(Array(5).fill({ id: 1, name: "User" }));

    const progress = await calculateBadgeProgress(1);

    const socialBadge = progress.find((p) => p.badgeName === "Social");
    expect(socialBadge?.percentage).toBe(50); // 5/10
    expect(socialBadge?.current).toBe(5);

    const popularBadge = progress.find((p) => p.badgeName === "Popular");
    expect(popularBadge?.percentage).toBe(50); // 50/100
    expect(popularBadge?.current).toBe(50);
  });

  it("should mark badges as unlocked when present in user badges", async () => {
    // Mock: usuário com badge "Primeira Postagem" desbloqueado
    vi.mocked(db.getUserBadges).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        badgeId: 1,
        earnedAt: new Date(),
        badge: {
          id: 1,
          name: "Primeira Postagem",
          description: "Criou seu primeiro post",
          iconUrl: "📝",
          requiredPoints: 0,
          requiredLevel: 0,
          requiredAction: null,
          createdAt: new Date(),
        },
      },
    ]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 1, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([
      {
        id: 1,
        content: "Test",
        authorId: 1,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        imageUrl: null,
        visibility: "public",
        communityId: null,
      },
    ]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    const firstPostBadge = progress.find((p) => p.badgeName === "Primeira Postagem");
    expect(firstPostBadge?.isUnlocked).toBe(true);
  });

  it("should cap percentage at 100%", async () => {
    // Mock: usuário com 2000 curtidas (mais que o necessário para Influencer)
    vi.mocked(db.getUserBadges).mockResolvedValue([]);
    vi.mocked(db.getUserStats).mockResolvedValue({ postCount: 1, commentCount: 0 });
    vi.mocked(db.getUserPosts).mockResolvedValue([
      {
        id: 1,
        content: "Viral post",
        authorId: 1,
        likeCount: 2000,
        commentCount: 0,
        createdAt: new Date(),
        imageUrl: null,
        visibility: "public",
        communityId: null,
      },
    ]);
    vi.mocked(db.getUserCommunities).mockResolvedValue([]);
    vi.mocked(db.getAllCommunities).mockResolvedValue([]);
    vi.mocked(db.getFollowers).mockResolvedValue([]);
    vi.mocked(db.getFollowing).mockResolvedValue([]);

    const progress = await calculateBadgeProgress(1);

    const influencerBadge = progress.find((p) => p.badgeName === "Influencer");
    expect(influencerBadge?.percentage).toBe(100); // Capped at 100%
    expect(influencerBadge?.current).toBe(1000); // Capped at required
  });
});
