export interface AIReview {
  originality: number;
  clarity: number;
  uxPotential: number;
  viralityPotential: number;
  investorCuriosity: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Launch Feedback Loop — see ceo-plans/launch-feedback-loop-20260413.md
// ═══════════════════════════════════════════════════════════════════════════

export type FeedbackActionType =
  | "tagline_rewrite"
  | "description_rewrite"
  | "demo_add"
  | "demo_quality"
  | "audience_narrow"
  | "cta_revamp"
  | "tag_fix"
  | "category_retarget"
  | "thumbnail_upgrade"
  | "pricing_clarify";

export type FeedbackSeverity = "must_fix" | "should_try" | "consider";

export type FeedbackSuccessMetric =
  | "upvotes"
  | "plays"
  | "shares"
  | "ctr"
  | "retention"
  | "remix_count";

export type FeedbackStatus =
  | "suggested"
  | "applied"
  | "skipped"
  | "rejected"
  | "expired";

export interface FeedbackOutcomeDelta {
  metric: FeedbackSuccessMetric;
  baseline: number;
  after: number;
  delta_pct: number;
  window_hours: number;
}

export interface FeedbackAction {
  action_id: string;
  review_id: string;
  type: FeedbackActionType;
  severity: FeedbackSeverity;
  rationale: string;
  current_value: string | null;
  suggested_values: string[];
  success_metric: FeedbackSuccessMetric;
  status: FeedbackStatus;
  applied_value?: string;
  applied_at?: string;
  reject_reason?: string;
  outcome_delta?: FeedbackOutcomeDelta;
  outcome_at?: string;
}

export interface StructuredReview {
  review_id: string;
  actions: FeedbackAction[];
  // Legacy score fields — kept for backwards compat with existing AIReview shape.
  originality: number;
  clarity: number;
  ux_potential: number;
  virality_potential: number;
  investor_curiosity: number;
}

export interface BehaviorScore {
  plays: number;
  avgStaySeconds: number;
  shareRate: number;
  remixCount: number;
  aiScore: number;
  compound: number; // weighted total
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  tags: string[];
  thumbnail: string;
  views: number;
  upvotes: number;
  plays: number;
  shares: number;
  remixCount: number;
  score: number;
  behaviorScore: BehaviorScore;
  createdAt: string;
  featured: boolean;
  aiReview: AIReview;
  demoType: "chat" | "sandbox" | "preview" | "embedded";
  demoUrl?: string;
  demoContent?: string;
  /** Optional short (≤30s) looping MP4/WebM preview URL. When present,
      HeroCard renders this in place of the static evo sprite. */
  demoVideoUrl?: string;
  parentId?: string; // remix parent
  parentTitle?: string;
  viralBoosted?: boolean;
  // RPG extensions
  hero?: HeroStats;
  funding?: FundingInfo;
  // Migration 072 — Born From Funeral narrative arc.
  // When a creator goes Funeral → Revival → Validator → /submit, this carries
  // the predecessor's id. HeroCard renders a 🪦 badge so visitors see the arc.
  fromFuneralId?: string;
  fromIdeaFuneralId?: string;
}

export type ProjectCategory =
  | "AI Agent"
  | "AI Tool"
  | "AI Game"
  | "AI Workflow"
  | "AI Utility"
  | "Experimental"
  | "Demo";

export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  projectCount: number;
  totalUpvotes: number;
  totalPlays: number;
  totalRemixes: number;
  rank: number;
  weeklyGrowth: number; // percentage
  topProjectIds: string[];
  joinedAt: string;
  badges: CreatorBadge[];
  // RPG extensions
  skillQuadrant?: SkillQuadrant;
  pixelBadges?: PixelBadge[];
}

export type CreatorBadge =
  | "top-creator"
  | "trending"
  | "remix-king"
  | "weekly-winner"
  | "pioneer"
  | "viral";

export interface Idea {
  id: string;
  title: string;
  description: string;
  // Optional pre-translated Chinese versions. When lang === "zh" and these
  // are set, IdeaCard renders them; otherwise falls back to the EN `title`
  // and `description`. Mock ideas have these populated; user-submitted
  // ideas may not (until we add a translate-on-submit step).
  title_zh?: string;
  description_zh?: string;
  creatorName: string;
  createdAt: string;
  category: ProjectCategory;
  aiEvaluation: IdeaEvaluation;
  upvotes: number;
  status: "idea" | "in-progress" | "launched";
  launchedProjectId?: string;
}

export interface IdeaEvaluation {
  viability: number;
  marketFit: number;
  competition: "low" | "moderate" | "high" | "saturated";
  uniqueness: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  suggestions: string[];
  similarProjects: string[];
  estimatedCategory: ProjectCategory;
}

export interface ShareContent {
  twitter: string;
  xiaohongshu: string;
  douyin: string;
  embedCode: string;
  playableUrl: string;
}

export interface Event {
  id: string;
  title: string;
  type: "hackathon" | "salon" | "meetup" | "demo-day";
  date: string;
  location: string;
  organizer: string;
  description: string;
  isOnline: boolean;
  featured: boolean;
  image?: string;
  topProjectIds?: string[];
  aiGeneratedTopics?: string[];
  participantCount?: number;
  status?: "upcoming" | "live" | "completed";
}

export interface TrendInsight {
  id: string;
  title: string;
  type: "rising" | "saturated" | "opportunity" | "emerging";
  signal: "strong" | "moderate" | "early";
  summary: string;
  momentum: number;
  confidence: number;
  category: string;
}

export interface WeeklyWinner {
  week: string;
  projectId: string;
  projectTitle: string;
  creatorName: string;
  score: number;
  category: ProjectCategory;
}

// ═══════════════════════════════════════════════════════════════════════════
// RPG System Types
// ═══════════════════════════════════════════════════════════════════════════

export interface HeroStats {
  level: number;
  exp: number;
  expToNextLevel: number;
  heroClass: HeroClass;
  attributes: HeroAttributes;
  skillTree: SkillNode[];
  evolutionStage: EvolutionStage;
  evolutionPoints: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

export type HeroClass =
  | "Architect"   // AI Agent / AI Workflow
  | "Artisan"     // AI Tool
  | "Enchanter"   // AI Game / Demo
  | "Alchemist"   // Experimental
  | "Sentinel";   // AI Utility

export type EvolutionStage =
  | "Seed"        // Just created — Common
  | "Active"      // Has demo/basic function — Uncommon
  | "Growing"     // Has users/feedback — Rare
  | "Breakout"    // Has traction — Epic
  | "Legend"      // Hot project — Legendary
  | "Myth";       // Viral + VC interest — Mythic

export interface HeroAttributes {
  power: number;       // originality + upvotes
  resilience: number;  // avgStaySeconds + plays
  charisma: number;    // shares + viralityPotential
  wisdom: number;      // clarity + suggestions quality
  agility: number;     // remixCount + responsiveness
  stability: number;   // investorCuriosity + consistency
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  unlocked: boolean;
  requiredLevel: number;
  parentNodeId?: string;
  effect: string;
  icon: string; // lucide icon name
}

export interface BattleResult {
  id: string;
  challengerId: string;
  defenderId: string;
  rounds: BattleRound[];
  winner: string;
  expGained: { challenger: number; defender: number };
  timestamp: string;
}

export interface BattleRound {
  attribute: keyof HeroAttributes;
  challengerValue: number;
  defenderValue: number;
  winner: "challenger" | "defender" | "draw";
  narrative: string;
  isCritical: boolean;
}

export interface FundingInfo {
  goal: number;
  raised: number;
  donors: number;
  vcInterest: number; // 0-100
}

export interface SkillQuadrant {
  engineering: number;
  aesthetics: number;
  logic: number;
  growth: number;
  agility: number;
  stability: number;
}

export interface PixelBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or pixel art reference
  rarity: "common" | "uncommon" | "rare" | "legendary";
  earnedAt: string;
}
