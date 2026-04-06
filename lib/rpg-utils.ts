import type {
  Project,
  ProjectCategory,
  HeroStats,
  HeroClass,
  HeroAttributes,
  EvolutionStage,
  SkillNode,
  SkillQuadrant,
  Creator,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Core RPG Computations — derive all stats from existing project data
// ═══════════════════════════════════════════════════════════════════════════

/** Map project category to RPG hero class */
export function computeClass(category: ProjectCategory): HeroClass {
  switch (category) {
    case "AI Agent":
    case "AI Workflow":
      return "Architect";
    case "AI Tool":
      return "Artisan";
    case "AI Game":
    case "Demo":
      return "Enchanter";
    case "Experimental":
      return "Alchemist";
    case "AI Utility":
      return "Sentinel";
  }
}

/** Compute level from compound behavior score (1-50 range) */
export function computeLevel(project: Project): number {
  const { compound } = project.behaviorScore;
  const { score } = project;
  const raw = (compound * 0.6 + score * 0.4) / 2;
  return Math.max(1, Math.min(50, Math.floor(raw / 2) + 1));
}

/** EXP curve — exponential growth per level */
export function getExpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

/** Current EXP within current level (partial progress) */
export function computeCurrentExp(project: Project): number {
  const level = computeLevel(project);
  const total = getExpToNextLevel(level);
  // Use upvotes + plays as raw EXP source
  const rawExp = project.upvotes * 3 + project.plays * 1 + project.shares * 5;
  return rawExp % total;
}

/** Map level to evolution stage */
export function computeEvolutionStage(level: number): EvolutionStage {
  if (level <= 5) return "Spark";
  if (level <= 15) return "Flame";
  if (level <= 30) return "Inferno";
  return "Phoenix";
}

/** Clamp a value to 1-100 */
function clamp(value: number, min = 1, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** Compute 6 hero attributes from existing aiReview + behaviorScore */
export function computeAttributes(project: Project): HeroAttributes {
  const { aiReview: ai, behaviorScore: bs } = project;

  return {
    power: clamp(ai.originality * 0.7 + (project.upvotes / 20) * 0.3),
    resilience: clamp(
      (bs.avgStaySeconds / 3) * 0.5 + (bs.plays / 50) * 0.5
    ),
    charisma: clamp(
      ai.viralityPotential * 0.6 + (project.shares / 10) * 0.4
    ),
    wisdom: clamp(ai.clarity * 0.6 + ai.uxPotential * 0.4),
    agility: clamp(
      (bs.remixCount / 5) * 0.4 + (bs.shareRate * 100) * 0.6
    ),
    stability: clamp(
      ai.investorCuriosity * 0.7 + (bs.aiScore / 10) * 0.3
    ),
  };
}

/** Compute HP (Innovation score) — range 50-999 */
export function computeHP(project: Project): number {
  const base = project.aiReview.originality * 5;
  const levelBonus = computeLevel(project) * 10;
  return Math.min(999, Math.max(50, Math.round(base + levelBonus)));
}

/** Compute MP (Scalability/Logic) — range 30-500 */
export function computeMP(project: Project): number {
  const base = project.aiReview.clarity * 2 + project.aiReview.uxPotential * 2;
  const levelBonus = computeLevel(project) * 5;
  return Math.min(500, Math.max(30, Math.round(base + levelBonus)));
}

/** Generate full HeroStats for a project */
export function computeHeroStats(project: Project): HeroStats {
  const level = computeLevel(project);
  const heroClass = computeClass(project.category);
  const hp = computeHP(project);
  const mp = computeMP(project);

  return {
    level,
    exp: computeCurrentExp(project),
    expToNextLevel: getExpToNextLevel(level),
    heroClass,
    attributes: computeAttributes(project),
    skillTree: getSkillTree(heroClass, level),
    evolutionStage: computeEvolutionStage(level),
    evolutionPoints: Math.floor(project.upvotes * 0.5 + project.plays * 0.2),
    hp,
    maxHp: hp,
    mp,
    maxMp: mp,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Skill Trees — per class, 3 tiers
// ═══════════════════════════════════════════════════════════════════════════

const SKILL_TREES: Record<HeroClass, Omit<SkillNode, "unlocked">[]> = {
  Architect: [
    // Tier 1
    { id: "arc-1", name: "Blueprint", description: "Structured architecture foundations", tier: 1, requiredLevel: 1, effect: "+10% Wisdom", icon: "Layout" },
    { id: "arc-2", name: "Pipeline", description: "Efficient data flow patterns", tier: 1, requiredLevel: 3, effect: "+10% Agility", icon: "GitBranch" },
    { id: "arc-3", name: "Orchestrate", description: "Multi-agent coordination", tier: 1, requiredLevel: 5, effect: "+15% Power", icon: "Network" },
    // Tier 2
    { id: "arc-4", name: "Sentinel Core", description: "Self-healing error recovery", tier: 2, requiredLevel: 8, parentNodeId: "arc-1", effect: "+20% Stability", icon: "Shield" },
    { id: "arc-5", name: "Swarm Logic", description: "Distributed decision making", tier: 2, requiredLevel: 12, parentNodeId: "arc-3", effect: "+20% Power", icon: "Brain" },
    // Tier 3
    { id: "arc-6", name: "Singularity", description: "Autonomous system evolution", tier: 3, requiredLevel: 20, parentNodeId: "arc-5", effect: "+30% All Stats", icon: "Zap" },
  ],
  Artisan: [
    { id: "art-1", name: "Pixel Perfect", description: "UI precision mastery", tier: 1, requiredLevel: 1, effect: "+10% Charisma", icon: "Paintbrush" },
    { id: "art-2", name: "Quick Craft", description: "Rapid prototyping", tier: 1, requiredLevel: 3, effect: "+10% Agility", icon: "Wrench" },
    { id: "art-3", name: "User Empathy", description: "Deep UX understanding", tier: 1, requiredLevel: 5, effect: "+15% Wisdom", icon: "Heart" },
    { id: "art-4", name: "Polish", description: "Flawless interactions", tier: 2, requiredLevel: 8, parentNodeId: "art-1", effect: "+20% Charisma", icon: "Sparkles" },
    { id: "art-5", name: "Tool Forge", description: "Create tools that create tools", tier: 2, requiredLevel: 12, parentNodeId: "art-2", effect: "+20% Power", icon: "Hammer" },
    { id: "art-6", name: "Masterwork", description: "Legendary craft quality", tier: 3, requiredLevel: 20, parentNodeId: "art-4", effect: "+30% All Stats", icon: "Crown" },
  ],
  Enchanter: [
    { id: "enc-1", name: "Illusion", description: "Captivating visual effects", tier: 1, requiredLevel: 1, effect: "+10% Charisma", icon: "Wand2" },
    { id: "enc-2", name: "Game Loop", description: "Addictive interaction patterns", tier: 1, requiredLevel: 3, effect: "+10% Resilience", icon: "RefreshCw" },
    { id: "enc-3", name: "Narrative", description: "Compelling story weaving", tier: 1, requiredLevel: 5, effect: "+15% Charisma", icon: "BookOpen" },
    { id: "enc-4", name: "Procedural", description: "Infinite content generation", tier: 2, requiredLevel: 8, parentNodeId: "enc-2", effect: "+20% Power", icon: "Dices" },
    { id: "enc-5", name: "Immersion", description: "Total experience absorption", tier: 2, requiredLevel: 12, parentNodeId: "enc-3", effect: "+20% Resilience", icon: "Eye" },
    { id: "enc-6", name: "World Engine", description: "Living, breathing universes", tier: 3, requiredLevel: 20, parentNodeId: "enc-4", effect: "+30% All Stats", icon: "Globe" },
  ],
  Alchemist: [
    { id: "alc-1", name: "Experiment", description: "Fearless innovation", tier: 1, requiredLevel: 1, effect: "+10% Power", icon: "FlaskConical" },
    { id: "alc-2", name: "Transmute", description: "Transform data into insights", tier: 1, requiredLevel: 3, effect: "+10% Wisdom", icon: "Repeat" },
    { id: "alc-3", name: "Catalyst", description: "Accelerate breakthroughs", tier: 1, requiredLevel: 5, effect: "+15% Agility", icon: "Flame" },
    { id: "alc-4", name: "Fusion", description: "Merge disparate paradigms", tier: 2, requiredLevel: 8, parentNodeId: "alc-1", effect: "+20% Power", icon: "Atom" },
    { id: "alc-5", name: "Prophecy", description: "Predict emerging patterns", tier: 2, requiredLevel: 12, parentNodeId: "alc-2", effect: "+20% Stability", icon: "Telescope" },
    { id: "alc-6", name: "Philosopher Stone", description: "Turn anything into gold", tier: 3, requiredLevel: 20, parentNodeId: "alc-4", effect: "+30% All Stats", icon: "Gem" },
  ],
  Sentinel: [
    { id: "sen-1", name: "Fortify", description: "Robust error handling", tier: 1, requiredLevel: 1, effect: "+10% Stability", icon: "ShieldCheck" },
    { id: "sen-2", name: "Monitor", description: "Real-time system awareness", tier: 1, requiredLevel: 3, effect: "+10% Resilience", icon: "Activity" },
    { id: "sen-3", name: "Optimize", description: "Peak performance tuning", tier: 1, requiredLevel: 5, effect: "+15% Agility", icon: "Gauge" },
    { id: "sen-4", name: "Firewall", description: "Impenetrable defenses", tier: 2, requiredLevel: 8, parentNodeId: "sen-1", effect: "+20% Stability", icon: "Lock" },
    { id: "sen-5", name: "Auto-Scale", description: "Infinite scalability", tier: 2, requiredLevel: 12, parentNodeId: "sen-3", effect: "+20% Resilience", icon: "Maximize" },
    { id: "sen-6", name: "Immortal", description: "Zero-downtime eternal runtime", tier: 3, requiredLevel: 20, parentNodeId: "sen-5", effect: "+30% All Stats", icon: "Infinity" },
  ],
};

/** Get skill tree for a class with unlock states based on level */
export function getSkillTree(heroClass: HeroClass, level: number): SkillNode[] {
  return SKILL_TREES[heroClass].map((node) => ({
    ...node,
    unlocked: level >= node.requiredLevel,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// Creator Skill Quadrant
// ═══════════════════════════════════════════════════════════════════════════

/** Derive creator skill quadrant from their projects and stats */
export function computeSkillQuadrant(
  creator: Creator,
  creatorProjects: Project[]
): SkillQuadrant {
  if (creatorProjects.length === 0) {
    return { engineering: 50, aesthetics: 50, logic: 50, growth: 50, agility: 50, stability: 50 };
  }

  const avgAttr = (key: keyof HeroAttributes) => {
    const sum = creatorProjects.reduce((acc, p) => {
      const attrs = computeAttributes(p);
      return acc + attrs[key];
    }, 0);
    return Math.round(sum / creatorProjects.length);
  };

  return {
    engineering: clamp(avgAttr("power") * 0.5 + avgAttr("stability") * 0.5),
    aesthetics: clamp(avgAttr("charisma") * 0.7 + avgAttr("wisdom") * 0.3),
    logic: clamp(avgAttr("wisdom") * 0.6 + avgAttr("stability") * 0.4),
    growth: clamp(creator.weeklyGrowth * 5 + avgAttr("agility") * 0.5),
    agility: avgAttr("agility"),
    stability: avgAttr("stability"),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Display Helpers
// ═══════════════════════════════════════════════════════════════════════════

export const CLASS_CONFIG: Record<
  HeroClass,
  { label: string; icon: string; color: string; description: string }
> = {
  Architect: {
    label: "Architect",
    icon: "Cpu",
    color: "#3b82f6",
    description: "Master builders of AI systems and workflows",
  },
  Artisan: {
    label: "Artisan",
    icon: "Palette",
    color: "#f59e0b",
    description: "Crafters of elegant tools and interfaces",
  },
  Enchanter: {
    label: "Enchanter",
    icon: "Sparkles",
    color: "#ec4899",
    description: "Weavers of games, stories, and experiences",
  },
  Alchemist: {
    label: "Alchemist",
    icon: "FlaskConical",
    color: "#22c55e",
    description: "Fearless experimenters pushing boundaries",
  },
  Sentinel: {
    label: "Sentinel",
    icon: "Shield",
    color: "#6366f1",
    description: "Guardians of reliability and utility",
  },
};

export const EVOLUTION_CONFIG: Record<
  EvolutionStage,
  { label: string; icon: string; cssClass: string; minLevel: number }
> = {
  Spark: { label: "Spark", icon: "Zap", cssClass: "evo-spark", minLevel: 1 },
  Flame: { label: "Flame", icon: "Flame", cssClass: "evo-flame", minLevel: 6 },
  Inferno: { label: "Inferno", icon: "Bomb", cssClass: "evo-inferno", minLevel: 16 },
  Phoenix: { label: "Phoenix", icon: "Bird", cssClass: "evo-phoenix", minLevel: 31 },
};

export const ATTRIBUTE_LABELS: Record<
  keyof HeroAttributes,
  { label: string; icon: string; cssClass: string }
> = {
  power: { label: "Power", icon: "Sword", cssClass: "attr-power" },
  resilience: { label: "Resilience", icon: "Heart", cssClass: "attr-resilience" },
  charisma: { label: "Charisma", icon: "Star", cssClass: "attr-charisma" },
  wisdom: { label: "Wisdom", icon: "BookOpen", cssClass: "attr-wisdom" },
  agility: { label: "Agility", icon: "Zap", cssClass: "attr-agility" },
  stability: { label: "Stability", icon: "Shield", cssClass: "attr-stability" },
};
