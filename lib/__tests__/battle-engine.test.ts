import { describe, it, expect } from "vitest";
import { simulateBattle } from "../battle-engine";
import type { Project } from "../types";

function makeMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test-1",
    title: "Test Project",
    tagline: "A test project",
    description: "Description",
    category: "AI Agent",
    creatorId: "creator-1",
    creatorName: "Tester",
    tags: ["test"],
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
      strengths: ["Good"],
      weaknesses: ["Needs work"],
      suggestions: ["Improve UX"],
    },
    demoType: "chat",
    hero: {
      level: 10,
      exp: 500,
      expToNextLevel: 1000,
      heroClass: "Architect",
      attributes: {
        power: 70,
        resilience: 60,
        charisma: 55,
        wisdom: 65,
        agility: 50,
        stability: 75,
      },
      skillTree: [],
      evolutionStage: "Flame",
      evolutionPoints: 3,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
    },
    ...overrides,
  };
}

const challenger = makeMockProject({ id: "challenger-1", title: "Challenger" });
const defender = makeMockProject({ id: "defender-1", title: "Defender" });

describe("Battle Engine", () => {
  it("should return a valid battle result", () => {
    const result = simulateBattle(challenger, defender);
    expect(result).toHaveProperty("winner");
    expect(result).toHaveProperty("rounds");
    expect(result).toHaveProperty("expGained");
    expect(result.challengerId).toBe("challenger-1");
    expect(result.defenderId).toBe("defender-1");
  });

  it("should have 4 rounds per battle", () => {
    const result = simulateBattle(challenger, defender);
    expect(result.rounds).toHaveLength(4);
  });

  it("should award EXP to both fighters", () => {
    const result = simulateBattle(challenger, defender);
    expect(result.expGained.challenger).toBeGreaterThan(0);
    expect(result.expGained.defender).toBeGreaterThan(0);
  });

  it("should throw when projects lack hero stats", () => {
    const noHero = makeMockProject({ id: "no-hero", hero: undefined });
    expect(() => simulateBattle(noHero, defender)).toThrow(
      "Both projects must have hero stats",
    );
  });

  it("should declare a winner matching one of the fighters", () => {
    const result = simulateBattle(challenger, defender);
    expect(["challenger-1", "defender-1"]).toContain(result.winner);
  });
});
