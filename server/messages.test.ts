import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Messages System", () => {
  const mockContext: Context = {
    user: {
      id: 1,
      openId: "test-user-1",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google",
      role: "user",
      bio: null,
      avatarUrl: null,
      points: 0,
      level: 1,
      inviteCode: null,
      invitedBy: null,
      isBanned: false,
      bannedUntil: null,
      banReason: null,
      hasCompletedOnboarding: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };

  const caller = appRouter.createCaller(mockContext);

  it("should get user conversations", async () => {
    const result = await caller.messages.conversations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get unread message count", async () => {
    const result = await caller.messages.unreadCount();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should create or get conversation", async () => {
    const result = await caller.messages.getOrCreate({ otherUserId: 2 });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("user1Id");
    expect(result).toHaveProperty("user2Id");
  });

  it("should send message to conversation", async () => {
    // First create/get conversation
    const conversation = await caller.messages.getOrCreate({ otherUserId: 2 });
    
    // Then send message
    const result = await caller.messages.send({
      conversationId: conversation.id,
      content: "Test message",
    });
    
    // sendMessage returns the message object directly
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.content).toBe("Test message");
  });

  it("should mark messages as read", async () => {
    const conversation = await caller.messages.getOrCreate({ otherUserId: 2 });
    
    const result = await caller.messages.markAsRead({
      conversationId: conversation.id,
    });
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should list conversation messages", async () => {
    const conversation = await caller.messages.getOrCreate({ otherUserId: 2 });
    
    const result = await caller.messages.list({
      conversationId: conversation.id,
    });
    
    expect(Array.isArray(result)).toBe(true);
  });
});
