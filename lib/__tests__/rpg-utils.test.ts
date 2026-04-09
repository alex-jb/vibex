import { describe, it, expect } from "vitest";
import {
  computeClass,
  computeLevel,
  getExpToNextLevel,
  computeCurrentExp,
  computeEvolutionStage,
  computeAttributes,
  computeHP,
  computeMP,
  computeHeroStats,
  getSkillTree,
  CLASS_CONFIG,
  EVOLUTION_CONFIG,
  ATTRIBUTE_LABELS,
} from "../rpg-utils";
import type { Project, ProjectCategory, HeroClass } from "../types";

// ─── Test factory ─────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test-1",
    title: "Test Project",
    tagline: "A test",
    description: "Description",
    category: "AI Agent",
    creatorId: "c-1",
    creatorName: "Tester",
    tags: [],
    thumbnail: "/thumb.png",
    views: 100,
    upvotes: 50,
    plays: 200,
    shares: 10,
    remixCount: 5,
    score: 80,
    behaviorScore: {
      plays: 200,
      avgStaySeconds: 45,
      shareRate: 0.05,
      remixCount: 5,
      aiScore: 75,
      compound: 70,
    },
    createdAt: "2025-01-01T00:00:00Z",
    featured: false,
    aiReview: {
      originality: 80,
      clarity: 75,
      uxPotential: 70,
      viralityPotential: 60,
      investorCuriosity: 65,
      strengths: [],
      weaknesses: [],
      suggestions: [],
    },
    demoType: "chat",
    hero: undefined,
    ...overrides,
  };
}

// ─── computeClass ─────────────────────────────────────────────────────────────

describe("computeClass", () => {
  const mapping: [ProjectCategory, HeroClass][] = [
    ["AI Agent", "Architect"],
    ["AI Workflow", "Architect"],
    ["AI Tool", "Artisan"],
    ["AI Game", "Enchanter"],
    ["Demo", "Enchanter"],
    ["Experimental", "Alchemist"],
    ["AI Utility", "Sentinel"],
  ];

  for (const [category, expectedClass] of mapping) {
    it(`maps "${category}" to "${expectedClass}"`, () => {
      expect(computeClass(category)).toBe(expectedClass);
    });
  }

  it("covers all ProjectCategory values", () => {
    // All categories should resolve without throwing
    const categories: ProjectCategory[] = [
      "AI Agent", "AI Tool", "AI Game", "AI Workflow",
      "AI Utility", "Experimental", "Demo",
    ];
    for (const cat of categories) {
      expect(() => computeClass(cat)).not.toThrow();
    }
  });
});

// ─── computeLevel ─────────────────────────────────────────────────────────────

describe("computeLevel", () => {
  it("returns at least 1 for any project", () => {
    const project = makeProject({ behaviorScore: { plays: 0, avgStaySeconds: 0, shareRate: 0, remixCount: 0, aiScore: 0, compound: 0 }, score: 0 });
    expect(computeLevel(project)).toBeGreaterThanOrEqual(1);
  });

  it("returns at most 50", () => {
    const project = makeProject({ behaviorScore: { plays: 9999, avgStaySeconds: 9999, shareRate: 1, remixCount: 9999, aiScore: 100, compound: 200 }, score: 100 });
    expect(computeLevel(project)).toBeLessThanOrEqual(50);
  });

  it("higher compound score leads to higher level", () => {
    const low = makeProject({ behaviorScore: { plays: 0, avgStaySeconds: 0, shareRate: 0, remixCount: 0, aiScore: 0, compound: 10 }, score: 10 });
    const high = makeProject({ behaviorScore: { plays: 0, avgStaySeconds: 0, shareRate: 0, remixCount: 0, aiScore: 0, compound: 100 }, score: 100 });
    expect(computeLevel(high)).toBeGreaterThanOrEqual(computeLevel(low));
  });

  it("returns an integer", () => {
    const project = makeProject();
    expect(Number.isInteger(computeLevel(project))).toBe(true);
  });
});

// ─── getExpToNextLevel ────────────────────────────────────────────────────────

describe("getExpToNextLevel", () => {
  it("level 1 requires 100 EXP", () => {
    expect(getExpToNextLevel(1)).toBe(100);
  });

  it("returns more EXP for higher levels (exponential growth)", () => {
    const exp1 = getExpToNextLevel(1);
    const exp5 = getExpToNextLevel(5);
    const exp10 = getExpToNextLevel(10);
    expect(exp5).toBeGreaterThan(exp1);
    expect(exp10).toBeGreaterThan(exp5);
  });

  it("returns a positive integer for any level 1-50", () => {
    for (let level = 1; level <= 50; level++) {
      const exp = getExpToNextLevel(level);
      expect(exp).toBeGreaterThan(0);
      expect(Number.isInteger(exp)).toBe(true);
    }
  });
});

// ─── computeCurrentExp ────────────────────────────────────────────────────────

describe("computeCurrentExp", () => {
  it("returns a non-negative number", () => {
    const project = makeProject();
    expect(computeCurrentExp(project)).toBeGreaterThanOrEqual(0);
  });

  it("current EXP is less than expToNextLevel", () => {
    const project = makeProject();
    const level = computeLevel(project);
    const cap = getExpToNextLevel(level);
    expect(computeCurrentExp(project)).toBeLessThan(cap);
  });

  it("returns 0 when all EXP sources are zero", () => {
    const project = makeProject({ upvotes: 0, plays: 0, shares: 0 });
    expect(computeCurrentExp(project)).toBe(0);
  });
});

// ─── computeEvolutionStage ────────────────────────────────────────────────────

describe("computeEvolutionStage", () => {
  it("new project with no activity → Seed", () => {
    const project = makeProject({ plays: 0, upvotes: 0, views: 0, shares: 0, score: 0 });
    expect(computeEvolutionStage(project)).toBe("Seed");
  });

  it("project with plays >= 50 → Active", () => {
    const project = makeProject({ plays: 50, upvotes: 0, views: 0, shares: 0, score: 0 });
    expect(computeEvolutionStage(project)).toBe("Active");
  });

  it("project with score >= 40 but few plays → Active", () => {
    const project = makeProject({ plays: 0, upvotes: 0, views: 0, shares: 0, score: 40 });
    expect(computeEvolutionStage(project)).toBe("Active");
  });

  it("project meeting Growing thresholds → Growing", () => {
    const project = makeProject({ plays: 500, upvotes: 50, views: 1000, shares: 0, score: 0 });
    expect(computeEvolutionStage(project)).toBe("Growing");
  });

  it("project meeting Breakout thresholds → Breakout", () => {
    const project = makeProject({
      plays: 1000,
      upvotes: 100,
      shares: 50,
      views: 0,
      score: 0,
      aiReview: { originality: 70, clarity: 75, uxPotential: 70, viralityPotential: 60, investorCuriosity: 65, strengths: [], weaknesses: [], suggestions: [] },
    });
    expect(computeEvolutionStage(project)).toBe("Breakout");
  });

  it("project meeting Legend thresholds → Legend", () => {
    const project = makeProject({ plays: 5000, upvotes: 500, shares: 200, views: 0, score: 85 });
    expect(computeEvolutionStage(project)).toBe("Legend");
  });

  it("project meeting Myth thresholds → Myth", () => {
    const project = makeProject({
      plays: 10000,
      upvotes: 1000,
      shares: 200,
      views: 0,
      score: 90,
      aiReview: { originality: 80, clarity: 75, uxPotential: 70, viralityPotential: 60, investorCuriosity: 80, strengths: [], weaknesses: [], suggestions: [] },
    });
    expect(computeEvolutionStage(project)).toBe("Myth");
  });
});

// ─── computeAttributes ────────────────────────────────────────────────────────

describe("computeAttributes", () => {
  it("returns all six attribute keys", () => {
    const attrs = computeAttributes(makeProject());
    expect(attrs).toHaveProperty("power");
    expect(attrs).toHaveProperty("resilience");
    expect(attrs).toHaveProperty("charisma");
    expect(attrs).toHaveProperty("wisdom");
    expect(attrs).toHaveProperty("agility");
    expect(attrs).toHaveProperty("stability");
  });

  it("all attributes are in range 1-100", () => {
    const attrs = computeAttributes(makeProject());
    for (const value of Object.values(attrs)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("all attributes are integers", () => {
    const attrs = computeAttributes(makeProject());
    for (const value of Object.values(attrs)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("higher originality increases power", () => {
    const low = computeAttributes(makeProject({ aiReview: { originality: 10, clarity: 50, uxPotential: 50, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } }));
    const high = computeAttributes(makeProject({ aiReview: { originality: 90, clarity: 50, uxPotential: 50, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } }));
    expect(high.power).toBeGreaterThan(low.power);
  });
});

// ─── computeHP ────────────────────────────────────────────────────────────────

describe("computeHP", () => {
  it("returns value in range 50-999", () => {
    const hp = computeHP(makeProject());
    expect(hp).toBeGreaterThanOrEqual(50);
    expect(hp).toBeLessThanOrEqual(999);
  });

  it("higher originality leads to higher HP", () => {
    const lowOrigin = makeProject({ aiReview: { originality: 10, clarity: 50, uxPotential: 50, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } });
    const highOrigin = makeProject({ aiReview: { originality: 90, clarity: 50, uxPotential: 50, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } });
    expect(computeHP(highOrigin)).toBeGreaterThan(computeHP(lowOrigin));
  });

  it("is an integer", () => {
    expect(Number.isInteger(computeHP(makeProject()))).toBe(true);
  });
});

// ─── computeMP ────────────────────────────────────────────────────────────────

describe("computeMP", () => {
  it("returns value in range 30-500", () => {
    const mp = computeMP(makeProject());
    expect(mp).toBeGreaterThanOrEqual(30);
    expect(mp).toBeLessThanOrEqual(500);
  });

  it("is an integer", () => {
    expect(Number.isInteger(computeMP(makeProject()))).toBe(true);
  });

  it("higher clarity leads to higher MP", () => {
    const lowClarity = makeProject({ aiReview: { originality: 50, clarity: 10, uxPotential: 10, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } });
    const highClarity = makeProject({ aiReview: { originality: 50, clarity: 90, uxPotential: 90, viralityPotential: 50, investorCuriosity: 50, strengths: [], weaknesses: [], suggestions: [] } });
    expect(computeMP(highClarity)).toBeGreaterThan(computeMP(lowClarity));
  });
});

// ─── computeHeroStats ─────────────────────────────────────────────────────────

describe("computeHeroStats", () => {
  it("returns all required HeroStats fields", () => {
    const stats = computeHeroStats(makeProject());
    expect(stats).toHaveProperty("level");
    expect(stats).toHaveProperty("exp");
    expect(stats).toHaveProperty("expToNextLevel");
    expect(stats).toHaveProperty("heroClass");
    expect(stats).toHaveProperty("attributes");
    expect(stats).toHaveProperty("skillTree");
    expect(stats).toHaveProperty("evolutionStage");
    expect(stats).toHaveProperty("evolutionPoints");
    expect(stats).toHaveProperty("hp");
    expect(stats).toHaveProperty("maxHp");
    expect(stats).toHaveProperty("mp");
    expect(stats).toHaveProperty("maxMp");
  });

  it("hp equals maxHp (fresh project)", () => {
    const stats = computeHeroStats(makeProject());
    expect(stats.hp).toBe(stats.maxHp);
  });

  it("mp equals maxMp (fresh project)", () => {
    const stats = computeHeroStats(makeProject());
    expect(stats.mp).toBe(stats.maxMp);
  });

  it("skillTree is a non-empty array", () => {
    const stats = computeHeroStats(makeProject());
    expect(Array.isArray(stats.skillTree)).toBe(true);
    expect(stats.skillTree.length).toBeGreaterThan(0);
  });

  it("evolutionPoints is non-negative", () => {
    const stats = computeHeroStats(makeProject());
    expect(stats.evolutionPoints).toBeGreaterThanOrEqual(0);
  });
});

// ─── getSkillTree ─────────────────────────────────────────────────────────────

describe("getSkillTree", () => {
  const classes: HeroClass[] = ["Architect", "Artisan", "Enchanter", "Alchemist", "Sentinel"];

  for (const heroClass of classes) {
    it(`returns 6 skills for ${heroClass}`, () => {
      const tree = getSkillTree(heroClass, 1);
      expect(tree).toHaveLength(6);
    });
  }

  it("tier 1 skills are unlocked at level 1", () => {
    const tree = getSkillTree("Architect", 1);
    const tier1 = tree.filter((n) => n.tier === 1);
    // Level 1 unlocks requiredLevel <= 1 nodes
    const unlocked = tier1.filter((n) => n.requiredLevel <= 1);
    expect(unlocked.every((n) => n.unlocked)).toBe(true);
  });

  it("tier 3 skills are locked at level 1", () => {
    const tree = getSkillTree("Architect", 1);
    const tier3 = tree.filter((n) => n.tier === 3);
    expect(tier3.every((n) => !n.unlocked)).toBe(true);
  });

  it("all tier 3 skills unlock at max level (50)", () => {
    const tree = getSkillTree("Architect", 50);
    const tier3 = tree.filter((n) => n.tier === 3);
    expect(tier3.every((n) => n.unlocked)).toBe(true);
  });

  it("each skill node has required fields", () => {
    const tree = getSkillTree("Artisan", 10);
    for (const node of tree) {
      expect(typeof node.id).toBe("string");
      expect(typeof node.name).toBe("string");
      expect(typeof node.tier).toBe("number");
      expect(typeof node.requiredLevel).toBe("number");
      expect(typeof node.unlocked).toBe("boolean");
    }
  });

  it("higher level unlocks more skills", () => {
    const low = getSkillTree("Sentinel", 1).filter((n) => n.unlocked).length;
    const high = getSkillTree("Sentinel", 20).filter((n) => n.unlocked).length;
    expect(high).toBeGreaterThan(low);
  });
});

// ─── CLASS_CONFIG ─────────────────────────────────────────────────────────────

describe("CLASS_CONFIG", () => {
  const classes: HeroClass[] = ["Architect", "Artisan", "Enchanter", "Alchemist", "Sentinel"];

  it("has an entry for every hero class", () => {
    for (const cls of classes) {
      expect(CLASS_CONFIG[cls]).toBeDefined();
    }
  });

  it("each entry has label, icon, color, description", () => {
    for (const cls of classes) {
      const cfg = CLASS_CONFIG[cls];
      expect(typeof cfg.label).toBe("string");
      expect(typeof cfg.icon).toBe("string");
      expect(typeof cfg.color).toBe("string");
      expect(typeof cfg.description).toBe("string");
      expect(cfg.description.length).toBeGreaterThan(0);
    }
  });

  it("all color values are valid hex codes", () => {
    for (const cls of classes) {
      expect(CLASS_CONFIG[cls].color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ─── EVOLUTION_CONFIG ─────────────────────────────────────────────────────────

describe("EVOLUTION_CONFIG", () => {
  it("has entries for Seed, Active, Growing, Breakout, Legend, Myth", () => {
    expect(EVOLUTION_CONFIG["Seed"]).toBeDefined();
    expect(EVOLUTION_CONFIG["Active"]).toBeDefined();
    expect(EVOLUTION_CONFIG["Growing"]).toBeDefined();
    expect(EVOLUTION_CONFIG["Breakout"]).toBeDefined();
    expect(EVOLUTION_CONFIG["Legend"]).toBeDefined();
    expect(EVOLUTION_CONFIG["Myth"]).toBeDefined();
  });

  it("each entry has label, icon, cssClass, color", () => {
    const stages = ["Seed", "Active", "Growing", "Breakout", "Legend", "Myth"] as const;
    for (const stage of stages) {
      const cfg = EVOLUTION_CONFIG[stage];
      expect(typeof cfg.label).toBe("string");
      expect(typeof cfg.icon).toBe("string");
      expect(typeof cfg.cssClass).toBe("string");
      expect(typeof cfg.color).toBe("string");
    }
  });
});

// ─── ATTRIBUTE_LABELS ─────────────────────────────────────────────────────────

describe("ATTRIBUTE_LABELS", () => {
  const attrs = ["power", "resilience", "charisma", "wisdom", "agility", "stability"] as const;

  it("has an entry for all six attributes", () => {
    for (const attr of attrs) {
      expect(ATTRIBUTE_LABELS[attr]).toBeDefined();
    }
  });

  it("each entry has label, icon, cssClass", () => {
    for (const attr of attrs) {
      const cfg = ATTRIBUTE_LABELS[attr];
      expect(typeof cfg.label).toBe("string");
      expect(typeof cfg.icon).toBe("string");
      expect(typeof cfg.cssClass).toBe("string");
    }
  });
});
