import { describe, it, expect } from "vitest";
import { BADGE_DEFINITIONS } from "./badges/definitions";

const badgeDefinitions = Object.values(BADGE_DEFINITIONS);

describe("Badge System E2E Tests", () => {
  it("should have 10 badge definitions", () => {
    expect(badgeDefinitions).toHaveLength(10);
  });

  it("should have 'Primeira Postagem' badge with correct event", () => {
    const badge = badgeDefinitions.find((b) => b.name === "Primeira Postagem");
    expect(badge).toBeDefined();
    expect(badge?.event).toBe("post_created");
    expect(badge?.description).toContain("primeiro post");
  });

  it("should have '100 Curtidas' badge with correct event", () => {
    const badge = badgeDefinitions.find((b) => b.name === "100 Curtidas");
    expect(badge).toBeDefined();
    expect(badge?.event).toBe("like_received");
    expect(badge?.description).toContain("curtidas");
  });

  it("should have 'Comentarista' badge with correct event", () => {
    const badge = badgeDefinitions.find((b) => b.name === "Comentarista");
    expect(badge).toBeDefined();
    expect(badge?.event).toBe("comment_created");
    expect(badge?.description).toContain("comentários");
  });

  it("should have 'Social' badge with correct event", () => {
    const badge = badgeDefinitions.find((b) => b.name === "Social");
    expect(badge).toBeDefined();
    expect(badge?.event).toBe("user_followed");
    expect(badge?.description).toContain("usuários");
  });

  it("should have 'Criador de Comunidade' badge with correct event", () => {
    const badge = badgeDefinitions.find((b) => b.name === "Criador de Comunidade");
    expect(badge).toBeDefined();
    expect(badge?.event).toBe("community_created");
    expect(badge?.description).toContain("comunidade");
  });



  it("should have unique icons for each badge", () => {
    const icons = badgeDefinitions.map((b) => b.icon);
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBe(badgeDefinitions.length);
  });

  it("should have unique names for each badge", () => {
    const names = badgeDefinitions.map((b) => b.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(badgeDefinitions.length);
  });

  it("should have valid trigger types", () => {
    const validTriggers = [
      "post_created",
      "like_received",
      "comment_created",
      "user_followed",
      "community_created",
      "community_member_joined",
    ];

    badgeDefinitions.forEach((badge) => {
      if (badge.event) {
        expect(validTriggers).toContain(badge.event);
      }
    });
  });

  it("should have descriptions for all badges", () => {
    badgeDefinitions.forEach((badge) => {
      expect(badge.description).toBeDefined();
      expect(badge.description.length).toBeGreaterThan(0);
    });
  });
});
