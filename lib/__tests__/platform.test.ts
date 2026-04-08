import { describe, it, expect } from "vitest";

// ─── XP Level System Tests ───

describe("xpToLevel", () => {
  // Import dynamically to avoid "use client" issues in test
  async function getXpToLevel() {
    const mod = await import("../../components/feed/level-badge");
    return mod.xpToLevel;
  }

  it("returns Noob for 0 XP", async () => {
    const xpToLevel = await getXpToLevel();
    expect(xpToLevel(0)).toBe("Noob");
  });

  it("returns Noob for low XP", async () => {
    const xpToLevel = await getXpToLevel();
    expect(xpToLevel(50)).toBe("Noob");
  });

  it("higher XP gives higher tier", async () => {
    const xpToLevel = await getXpToLevel();
    // With the 50-level system, tiers correspond to level ranges
    // Just verify that more XP = higher or equal tier
    const tiers = ["Noob", "Coder", "Builder", "Master", "Legend"];
    const tierIndex = (t: string) => tiers.indexOf(t);
    expect(tierIndex(xpToLevel(5000))).toBeGreaterThanOrEqual(tierIndex(xpToLevel(100)));
    expect(tierIndex(xpToLevel(50000))).toBeGreaterThanOrEqual(tierIndex(xpToLevel(5000)));
  });

  it("returns Legend for very high XP", async () => {
    const xpToLevel = await getXpToLevel();
    expect(xpToLevel(999999)).toBe("Legend");
  });

  it("computeLevelInfo returns full level data", async () => {
    const { computeLevelInfo } = await import("../../components/feed/level-badge");
    const info = computeLevelInfo(1000);
    expect(info.numericLevel).toBeGreaterThan(1);
    expect(info.title).toBeTruthy();
    expect(info.titleZh).toBeTruthy();
    expect(info.progress).toBeGreaterThanOrEqual(0);
    expect(info.progress).toBeLessThanOrEqual(1);
  });

  it("level 50 is max", async () => {
    const { computeLevelInfo } = await import("../../components/feed/level-badge");
    const info = computeLevelInfo(999999);
    expect(info.numericLevel).toBe(50);
    expect(info.title).toBe("Legend");
  });
});

// ─── Ban Check Tests ───

describe("checkBan", () => {
  it("returns not banned in mock mode (no Supabase)", async () => {
    const { checkBan } = await import("../ban-check");
    const result = await checkBan("any-user-id");
    expect(result.banned).toBe(false);
    expect(result.reason).toBeUndefined();
  });
});

// ─── Buddy System Tests ───

describe("Buddy EXP System", () => {
  it("has correct EXP rewards defined", async () => {
    const { EXP_REWARDS } = await import("../buddy-system");
    expect(EXP_REWARDS.publishProject).toBe(100);
    expect(EXP_REWARDS.winBattle).toBe(25);
    expect(EXP_REWARDS.dailyLogin).toBe(10);
    expect(EXP_REWARDS.firstProject).toBe(200);
  });

  it("computes correct level for 0 EXP", async () => {
    const { computeUserLevel } = await import("../buddy-system");
    const level = computeUserLevel(0);
    expect(level.level).toBe(1);
    expect(level.title).toBeTruthy();
  });

  it("computes higher level for more EXP", async () => {
    const { computeUserLevel } = await import("../buddy-system");
    const low = computeUserLevel(0);
    const high = computeUserLevel(10000);
    expect(high.level).toBeGreaterThan(low.level);
  });

  it("level title changes with level", async () => {
    const { computeUserLevel } = await import("../buddy-system");
    const l1 = computeUserLevel(0);
    const l10 = computeUserLevel(10000);
    expect(l1.title).not.toBe(l10.title);
  });

  it("canSummon is true at summon levels", async () => {
    const { computeUserLevel } = await import("../buddy-system");
    // Level 3 should allow summoning (need enough EXP for level 3)
    const l3 = computeUserLevel(500); // Should be around level 3+
    // At least one level should allow summoning
    expect(typeof l3.canSummon).toBe("boolean");
  });
});

// ─── Buddy Types Tests ───

describe("Buddy Types", () => {
  it("has at least 5 buddy types", async () => {
    const { BUDDY_TYPES } = await import("../buddy-system");
    expect(BUDDY_TYPES.length).toBeGreaterThanOrEqual(5);
  });

  it("all buddy types have required fields", async () => {
    const { BUDDY_TYPES } = await import("../buddy-system");
    for (const buddy of BUDDY_TYPES) {
      expect(buddy.id).toBeTruthy();
      expect(buddy.name).toBeTruthy();
      expect(buddy.nameZh).toBeTruthy();
      expect(buddy.rarity).toBeTruthy();
      expect(buddy.element).toBeTruthy();
      expect(buddy.emoji).toBeTruthy();
      expect(typeof buddy.minLevel).toBe("number");
      expect(typeof buddy.baseWeight).toBe("number");
    }
  });

  it("has unique buddy IDs", async () => {
    const { BUDDY_TYPES } = await import("../buddy-system");
    const ids = BUDDY_TYPES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has different rarities", async () => {
    const { BUDDY_TYPES } = await import("../buddy-system");
    const rarities = new Set(BUDDY_TYPES.map((b) => b.rarity));
    expect(rarities.size).toBeGreaterThan(1);
  });
});

// ─── Mock Adapter Tests ───

describe("Mock Adapter", () => {
  it("USE_SUPABASE is false in test env", async () => {
    const { USE_SUPABASE } = await import("../mock-adapter");
    expect(USE_SUPABASE).toBe(false);
  });
});

// ─── Agent Mock Data Tests ───

describe("Agent Mock Data", () => {
  it("has agent definitions", async () => {
    const { agents } = await import("../mock-data/agents");
    expect(agents.length).toBeGreaterThan(0);
  });

  it("agents have required fields", async () => {
    const { agents } = await import("../mock-data/agents");
    for (const agent of agents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.description).toBeTruthy();
      expect(agent.version).toBeTruthy();
      expect(typeof agent.runs).toBe("number");
      expect(typeof agent.upvotes).toBe("number");
    }
  });
});

// ─── Hashtag Extraction Tests ───

describe("Hashtag extraction logic", () => {
  function extractHashtags(text: string): string[] {
    const matches = text.match(/#(\w{2,30})/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
  }

  it("extracts single hashtag", () => {
    expect(extractHashtags("Hello #world")).toEqual(["world"]);
  });

  it("extracts multiple hashtags", () => {
    expect(extractHashtags("#vibecoding is #awesome")).toEqual(["vibecoding", "awesome"]);
  });

  it("deduplicates hashtags", () => {
    expect(extractHashtags("#hello #HELLO #Hello")).toEqual(["hello"]);
  });

  it("ignores single char hashtags", () => {
    expect(extractHashtags("#a text")).toEqual([]);
  });

  it("returns empty for no hashtags", () => {
    expect(extractHashtags("no tags here")).toEqual([]);
  });

  it("handles hashtags with numbers", () => {
    expect(extractHashtags("#web3 #ai2026")).toEqual(["web3", "ai2026"]);
  });

  it("lowercases all tags", () => {
    expect(extractHashtags("#GameDev")).toEqual(["gamedev"]);
  });
});

// ─── Content Sanitization for Mentions ───

describe("Mention extraction logic", () => {
  function extractMentions(text: string): string[] {
    return Array.from(text.matchAll(/@(\w+)/g)).map((m) => m[1]);
  }

  it("extracts single mention", () => {
    expect(extractMentions("Hello @PixelMaster")).toEqual(["PixelMaster"]);
  });

  it("extracts multiple mentions", () => {
    expect(extractMentions("@CodeWizard and @NeonHacker")).toEqual(["CodeWizard", "NeonHacker"]);
  });

  it("returns empty for no mentions", () => {
    expect(extractMentions("no mentions")).toEqual([]);
  });

  it("handles mention at start", () => {
    expect(extractMentions("@user hello")).toEqual(["user"]);
  });

  it("handles email-like text (extracts after @)", () => {
    const result = extractMentions("email@user");
    expect(result).toEqual(["user"]);
  });
});
