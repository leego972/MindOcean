import { describe, expect, it } from "vitest";
import { calculateCompleteness } from "./db";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── calculateCompleteness unit tests ─────────────────────

describe("calculateCompleteness", () => {
  it("returns 0 when profile is undefined", () => {
    expect(calculateCompleteness(undefined, 0, [])).toBe(0);
  });

  it("returns 0 for empty profile with no memories or assessments", () => {
    const emptyProfile = {
      id: 1, userId: 1,
      displayName: null, birthYear: null, location: null, occupation: null,
      lifeStory: null, coreValues: null, beliefs: null,
      likesAndJoys: null, dislikesAndFears: null,
      communicationStyle: null, humorStyle: null,
      importantPeople: null, legacyMessage: null, estateWishes: null,
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    expect(calculateCompleteness(emptyProfile, 0, [])).toBe(0);
  });

  it("scores profile fields correctly (50 points max)", () => {
    const profile = {
      id: 1, userId: 1,
      displayName: "John", birthYear: 1970, location: "NYC", occupation: "Engineer",
      lifeStory: "My story", coreValues: "Honesty", beliefs: "Be kind",
      likesAndJoys: "Music", dislikesAndFears: "Spiders",
      communicationStyle: "Direct", importantPeople: "Family",
      humorStyle: null, legacyMessage: null, estateWishes: null,
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    // All 11 scored fields are filled → 50 points
    expect(calculateCompleteness(profile, 0, [])).toBe(50);
  });

  it("scores memories correctly (20 points max, 4 per memory)", () => {
    const emptyProfile = {
      id: 1, userId: 1,
      displayName: null, birthYear: null, location: null, occupation: null,
      lifeStory: null, coreValues: null, beliefs: null,
      likesAndJoys: null, dislikesAndFears: null,
      communicationStyle: null, humorStyle: null,
      importantPeople: null, legacyMessage: null, estateWishes: null,
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    expect(calculateCompleteness(emptyProfile, 1, [])).toBe(4);
    expect(calculateCompleteness(emptyProfile, 3, [])).toBe(12);
    expect(calculateCompleteness(emptyProfile, 5, [])).toBe(20);
    expect(calculateCompleteness(emptyProfile, 10, [])).toBe(20); // capped at 20
  });

  it("scores assessments correctly (10 points each)", () => {
    const emptyProfile = {
      id: 1, userId: 1,
      displayName: null, birthYear: null, location: null, occupation: null,
      lifeStory: null, coreValues: null, beliefs: null,
      likesAndJoys: null, dislikesAndFears: null,
      communicationStyle: null, humorStyle: null,
      importantPeople: null, legacyMessage: null, estateWishes: null,
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    expect(calculateCompleteness(emptyProfile, 0, ["big_five"])).toBe(10);
    expect(calculateCompleteness(emptyProfile, 0, ["big_five", "cognitive"])).toBe(20);
    expect(calculateCompleteness(emptyProfile, 0, ["big_five", "cognitive", "competency"])).toBe(30);
  });

  it("returns 100 for a fully complete profile", () => {
    const fullProfile = {
      id: 1, userId: 1,
      displayName: "John", birthYear: 1970, location: "NYC", occupation: "Engineer",
      lifeStory: "My story", coreValues: "Honesty", beliefs: "Be kind",
      likesAndJoys: "Music", dislikesAndFears: "Spiders",
      communicationStyle: "Direct", importantPeople: "Family",
      humorStyle: "Dry wit", legacyMessage: "Be good", estateWishes: "House to Sarah",
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    // 50 (profile) + 20 (5+ memories) + 30 (all 3 assessments) = 100
    expect(calculateCompleteness(fullProfile, 5, ["big_five", "cognitive", "competency"])).toBe(100);
  });

  it("caps at 100 even with excess data", () => {
    const fullProfile = {
      id: 1, userId: 1,
      displayName: "John", birthYear: 1970, location: "NYC", occupation: "Engineer",
      lifeStory: "My story", coreValues: "Honesty", beliefs: "Be kind",
      likesAndJoys: "Music", dislikesAndFears: "Spiders",
      communicationStyle: "Direct", importantPeople: "Family",
      humorStyle: "Dry wit", legacyMessage: "Be good", estateWishes: "House to Sarah",
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    expect(calculateCompleteness(fullProfile, 100, ["big_five", "cognitive", "competency"])).toBe(100);
  });

  it("treats empty strings as unfilled", () => {
    const profile = {
      id: 1, userId: 1,
      displayName: "", birthYear: null, location: "  ", occupation: null,
      lifeStory: null, coreValues: null, beliefs: null,
      likesAndJoys: null, dislikesAndFears: null,
      communicationStyle: null, humorStyle: null,
      importantPeople: null, legacyMessage: null, estateWishes: null,
      completeness: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    // displayName is "" and location is "  " — both should be treated as empty
    expect(calculateCompleteness(profile, 0, [])).toBe(0);
  });
});

// ─── Auth router tests ────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const user: AuthenticatedUser = {
    id: 1, openId: "test-user", email: "test@example.com", name: "Test User",
    loginMethod: "manus", role: "user",
    createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

describe("auth.me", () => {
  it("returns the current user from context", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.openId).toBe("test-user");
    expect(result?.name).toBe("Test User");
  });

  it("returns null when no user is authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});
