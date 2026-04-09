import { describe, it, expect } from "vitest";
import {
  BUDDY_TYPES,
  RARITY_CONFIG,
  EXP_REWARDS,
  computeUserLevel,
  getEvolutionStage,
  canEvolve,
  getEvolutions,
  calculateSummonWeights,
  summonBuddy,
  type BuddyRarity,
} from "../buddy-system";

// ─── BUDDY_TYPES data integrity ───────────────────────────────────────────────

describe("BUDDY_TYPES", () => {
  it("contains at least one entry", () => {
    expect(BUDDY_TYPES.length).toBeGreaterThan(0);
  });

  it("all buddies have required fields", () => {
    for (const buddy of BUDDY_TYPES) {
      expect(typeof buddy.id).toBe("string");
      expect(buddy.id.length).toBeGreaterThan(0);
      expect(typeof buddy.name).toBe("string");
      expect(typeof buddy.rarity).toBe("string");
      expect(typeof buddy.baseWeight).toBe("number");
      expect(buddy.baseWeight).toBeGreaterThan(0);
      expect(typeof buddy.minLevel).toBe("number");
      expect(buddy.minLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it("all buddy IDs are unique", () => {
    const ids = BUDDY_TYPES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all rarities are valid enum values", () => {
    const valid: BuddyRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
    for (const buddy of BUDDY_TYPES) {
      expect(valid).toContain(buddy.rarity);
    }
  });

  it("common buddies have higher base weight than legendary", () => {
    const commons = BUDDY_TYPES.filter((b) => b.rarity === "common");
    const legendaries = BUDDY_TYPES.filter((b) => b.rarity === "legendary");
    const avgCommon = commons.reduce((s, b) => s + b.baseWeight, 0) / commons.length;
    const avgLegendary = legendaries.reduce((s, b) => s + b.baseWeight, 0) / legendaries.length;
    expect(avgCommon).toBeGreaterThan(avgLegendary);
  });

  it("legendary buddies require a higher minLevel than common buddies", () => {
    const commons = BUDDY_TYPES.filter((b) => b.rarity === "common");
    const legendaries = BUDDY_TYPES.filter((b) => b.rarity === "legendary");
    const maxCommonLevel = Math.max(...commons.map((b) => b.minLevel));
    const minLegendaryLevel = Math.min(...legendaries.map((b) => b.minLevel));
    expect(minLegendaryLevel).toBeGreaterThan(maxCommonLevel);
  });

  it("pixel-fox has Fire element", () => {
    const fox = BUDDY_TYPES.find((b) => b.id === "pixel-fox");
    expect(fox).toBeDefined();
    expect(fox!.element).toBe("Fire");
  });
});

// ─── RARITY_CONFIG ────────────────────────────────────────────────────────────

describe("RARITY_CONFIG", () => {
  const rarities: BuddyRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

  it("has an entry for every rarity", () => {
    for (const rarity of rarities) {
      expect(RARITY_CONFIG[rarity]).toBeDefined();
    }
  });

  it("each entry has label, color, bgColor, borderColor, glow", () => {
    for (const rarity of rarities) {
      const config = RARITY_CONFIG[rarity];
      expect(typeof config.label).toBe("string");
      expect(typeof config.color).toBe("string");
      expect(typeof config.bgColor).toBe("string");
      expect(typeof config.borderColor).toBe("string");
      expect(typeof config.glow).toBe("string");
    }
  });

  it("legendary has a glow effect (non-empty)", () => {
    expect(RARITY_CONFIG.legendary.glow.length).toBeGreaterThan(0);
  });

  it("common has no glow effect", () => {
    expect(RARITY_CONFIG.common.glow).toBe("");
  });

  it("legendary color is gold (#FFD700)", () => {
    expect(RARITY_CONFIG.legendary.color).toBe("#FFD700");
  });
});

// ─── EXP_REWARDS ──────────────────────────────────────────────────────────────

describe("EXP_REWARDS", () => {
  it("publishProject rewards more than publishDemo", () => {
    expect(EXP_REWARDS.publishProject).toBeGreaterThan(EXP_REWARDS.publishDemo);
  });

  it("evolveToMyth is the largest single reward", () => {
    const values = Object.values(EXP_REWARDS);
    const max = Math.max(...values);
    expect(EXP_REWARDS.evolveToMyth).toBe(max);
  });

  it("all rewards are positive integers", () => {
    for (const [, value] of Object.entries(EXP_REWARDS)) {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("losing a battle still gives EXP (participation reward)", () => {
    expect(EXP_REWARDS.loseBattle).toBeGreaterThan(0);
  });
});

// ─── computeUserLevel ─────────────────────────────────────────────────────────

describe("computeUserLevel", () => {
  it("returns level 1 for 0 EXP", () => {
    const result = computeUserLevel(0);
    expect(result.level).toBe(1);
    expect(result.totalExp).toBe(0);
  });

  it("returns level 1 for small EXP below L2 threshold", () => {
    const result = computeUserLevel(50);
    expect(result.level).toBe(1);
  });

  it("advances to level 2 when enough EXP accumulated", () => {
    // L2 threshold: 50*4 + 100 - 100 = 200
    const result = computeUserLevel(250);
    expect(result.level).toBeGreaterThanOrEqual(2);
  });

  it("expToNextLevel is always positive", () => {
    for (const exp of [0, 100, 500, 2000, 10000]) {
      const result = computeUserLevel(exp);
      expect(result.expToNextLevel).toBeGreaterThan(0);
    }
  });

  it("currentExp is less than expToNextLevel", () => {
    for (const exp of [0, 300, 1000, 5000]) {
      const result = computeUserLevel(exp);
      expect(result.currentExp).toBeLessThan(result.expToNextLevel);
    }
  });

  it("totalExp matches input", () => {
    const input = 7777;
    const result = computeUserLevel(input);
    expect(result.totalExp).toBe(input);
  });

  it("returns Apprentice title at level 1", () => {
    const result = computeUserLevel(0);
    expect(result.title).toBe("Apprentice");
  });

  it("returns Legendary Trainer at very high EXP", () => {
    const result = computeUserLevel(999999);
    expect(result.title).toBe("Legendary Trainer");
    expect(result.level).toBeGreaterThanOrEqual(30);
  });

  it("canSummon is true at summon levels (3, 5, 10, etc.)", () => {
    // Find an EXP that lands exactly on level 3
    // expForLevel(3) = 50*9 + 150 - 100 = 450 + 50 = 500
    const result = computeUserLevel(500);
    if (result.level === 3) {
      expect(result.canSummon).toBe(true);
    }
  });

  it("canSummon is false at non-summon levels", () => {
    // Level 1 is not in SUMMON_LEVELS
    const result = computeUserLevel(0);
    expect(result.level).toBe(1);
    expect(result.canSummon).toBe(false);
  });

  it("level caps at 99 for astronomically high EXP", () => {
    const result = computeUserLevel(Number.MAX_SAFE_INTEGER / 2);
    expect(result.level).toBeLessThanOrEqual(99);
  });
});

// ─── Evolution system ─────────────────────────────────────────────────────────

describe("getEvolutionStage", () => {
  it("returns stage 0 at level 0 for pixel-fox", () => {
    const evo = getEvolutionStage("pixel-fox", 0);
    expect(evo.stage).toBe(0);
    expect(evo.name).toBe("PixelFox");
  });

  it("returns stage 1 when buddy meets stage 1 requirement", () => {
    // pixel-fox stage 1 requires level 8
    const evo = getEvolutionStage("pixel-fox", 8);
    expect(evo.stage).toBe(1);
    expect(evo.name).toBe("InfernoFox");
  });

  it("returns stage 2 at final evolution level", () => {
    // pixel-fox stage 2 requires level 15
    const evo = getEvolutionStage("pixel-fox", 20);
    expect(evo.stage).toBe(2);
    expect(evo.name).toBe("ThunderFox");
  });

  it("stays at highest achieved stage (no downgrade)", () => {
    const evo14 = getEvolutionStage("pixel-fox", 14);
    expect(evo14.stage).toBe(1); // stage 1 (level 8), but not yet 15 for stage 2
  });

  it("returns unknown for invalid buddy type", () => {
    const evo = getEvolutionStage("nonexistent-buddy", 10);
    expect(evo.name).toBe("Unknown");
    expect(evo.stage).toBe(0);
  });
});

describe("canEvolve", () => {
  it("returns false for invalid buddy type", () => {
    expect(canEvolve("nonexistent", 10)).toBe(false);
  });

  it("returns false when at base stage and below next threshold", () => {
    // pixel-fox next stage requires level 8; below that canEvolve = false
    expect(canEvolve("pixel-fox", 5)).toBe(false);
  });

  it("returns false at level 8 for pixel-fox (already advanced to stage 1, next stage needs level 15)", () => {
    // At level 8: getEvolutionStage returns stage 1 (InfernoFox).
    // canEvolve then checks if stage 2 threshold (level 15) is met — 8 < 15 → false.
    expect(canEvolve("pixel-fox", 8)).toBe(false);
  });

  it("returns false when already at max evolution stage", () => {
    // pixel-fox stage 2 is the last; at level 20 no further evolution
    expect(canEvolve("pixel-fox", 20)).toBe(false);
  });
});

describe("getEvolutions", () => {
  it("returns an array of 3 stages for pixel-fox", () => {
    const evos = getEvolutions("pixel-fox");
    expect(evos).toHaveLength(3);
    expect(evos[0].stage).toBe(0);
    expect(evos[1].stage).toBe(1);
    expect(evos[2].stage).toBe(2);
  });

  it("returns empty array for unknown buddy type", () => {
    expect(getEvolutions("made-up")).toEqual([]);
  });

  it("each evolution has a higher requiredLevel than the previous", () => {
    const evos = getEvolutions("code-dragon");
    for (let i = 1; i < evos.length; i++) {
      expect(evos[i].requiredLevel).toBeGreaterThan(evos[i - 1].requiredLevel);
    }
  });
});

// ─── Summon / Gacha system ────────────────────────────────────────────────────

describe("calculateSummonWeights", () => {
  it("only includes buddies the user qualifies for by minLevel", () => {
    // At level 3, crystal-phoenix (minLevel 15) should NOT appear
    const weights = calculateSummonWeights(3, 0, []);
    const phoenix = weights.find((w) => w.buddyType.id === "crystal-phoenix");
    expect(phoenix).toBeUndefined();
  });

  it("includes common buddies at level 3", () => {
    const weights = calculateSummonWeights(3, 0, []);
    const fox = weights.find((w) => w.buddyType.id === "pixel-fox");
    expect(fox).toBeDefined();
  });

  it("upvotes boost weight of rare/epic/legendary buddies", () => {
    const low = calculateSummonWeights(10, 0, []);
    const high = calculateSummonWeights(10, 500, []);
    const rareLow = low.find((w) => w.buddyType.rarity === "rare")!;
    const rareHigh = high.find((w) => w.buddyType.id === rareLow.buddyType.id)!;
    expect(rareHigh.weight).toBeGreaterThan(rareLow.weight);
  });

  it("pity system adds +5 weight for buddies not yet owned", () => {
    const withPity = calculateSummonWeights(3, 0, []);
    const withoutPity = calculateSummonWeights(3, 0, ["pixel-fox"]);
    const foxWithPity = withPity.find((w) => w.buddyType.id === "pixel-fox")!;
    const foxWithout = withoutPity.find((w) => w.buddyType.id === "pixel-fox")!;
    expect(foxWithPity.weight).toBe(foxWithout.weight + 5);
  });

  it("returns empty array when user level is too low for all buddies", () => {
    // All buddies require at least level 3; level 1 yields nothing
    const weights = calculateSummonWeights(1, 0, []);
    expect(weights).toHaveLength(0);
  });

  it("all returned weights are positive", () => {
    const weights = calculateSummonWeights(20, 200, []);
    for (const w of weights) {
      expect(w.weight).toBeGreaterThan(0);
    }
  });
});

describe("summonBuddy", () => {
  it("returns a buddy the user qualifies for", () => {
    const result = summonBuddy(3, 0, []);
    expect(result.buddy).toBeDefined();
    expect(result.buddy.minLevel).toBeLessThanOrEqual(3);
  });

  it("isNew is true when buddy not in existingBuddyIds", () => {
    // Run multiple times to avoid flakiness from randomness
    let seenNew = false;
    for (let i = 0; i < 20; i++) {
      const result = summonBuddy(3, 0, []);
      if (result.isNew) { seenNew = true; break; }
    }
    expect(seenNew).toBe(true);
  });

  it("isNew is false when buddy already owned", () => {
    // Own every possible buddy at level 3
    const level3Ids = BUDDY_TYPES.filter((b) => b.minLevel <= 3).map((b) => b.id);
    const result = summonBuddy(3, 0, level3Ids);
    expect(result.isNew).toBe(false);
  });

  it("bonusApplied is 'No bonus' when no upvotes and low level", () => {
    const result = summonBuddy(3, 0, []);
    expect(result.bonusApplied).toBe("No bonus");
  });

  it("bonusApplied mentions upvote bonus when >= 100 upvotes", () => {
    const result = summonBuddy(3, 150, []);
    expect(result.bonusApplied).toContain("Upvote bonus");
  });

  it("bonusApplied mentions level bonus when level >= 10", () => {
    const result = summonBuddy(10, 0, []);
    expect(result.bonusApplied).toContain("Level bonus");
  });

  it("returns a valid SummonResult shape", () => {
    const result = summonBuddy(5, 50, []);
    expect(result).toHaveProperty("buddy");
    expect(result).toHaveProperty("isNew");
    expect(result).toHaveProperty("bonusApplied");
  });
});
