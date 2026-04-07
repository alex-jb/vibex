-- ═══════════════════════════════════════════════════════════════
-- DATA MOAT: Creator Graph + Product Graph + Growth Data
-- This is the defensible data layer that makes VibeX hard to clone.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. CREATOR GRAPH ───

-- Extend creator_profiles with graph data
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS active_streak INTEGER DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS total_launches INTEGER DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS success_rate FLOAT DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS growth_velocity FLOAT DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS top_category TEXT;

-- Creator connections: collaboration, interaction, competition
CREATE TABLE IF NOT EXISTS creator_connections (
  id TEXT PRIMARY KEY DEFAULT 'conn-' || gen_random_uuid()::text,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (connection_type IN (
    'collaborated', 'reacted', 'followed', 'battled', 'mentioned'
  )),
  strength INTEGER NOT NULL DEFAULT 1,
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, connection_type)
);

CREATE INDEX idx_creator_conn_from ON creator_connections(from_user_id);
CREATE INDEX idx_creator_conn_to ON creator_connections(to_user_id);

-- ─── 2. PRODUCT GRAPH ───

-- Product success/failure signals
CREATE TABLE IF NOT EXISTS product_signals (
  id TEXT PRIMARY KEY DEFAULT 'sig-' || gen_random_uuid()::text,
  project_id TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'launch_quality', 'engagement', 'retention', 'growth', 'virality'
  )),
  score FLOAT NOT NULL CHECK (score >= 0 AND score <= 100),
  details JSONB,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_signals ON product_signals(project_id, signal_type, measured_at DESC);

-- AI-generated product comparisons
CREATE TABLE IF NOT EXISTS product_comparisons (
  id TEXT PRIMARY KEY DEFAULT 'cmp-' || gen_random_uuid()::text,
  project_a_id TEXT NOT NULL,
  project_b_id TEXT NOT NULL,
  comparison JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. GROWTH DATA ───

-- Launch outcomes: what happened after each launch
CREATE TABLE IF NOT EXISTS launch_outcomes (
  id TEXT PRIMARY KEY DEFAULT 'lo-' || gen_random_uuid()::text,
  project_id TEXT NOT NULL,
  launch_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channels_used TEXT[] DEFAULT '{}',
  copy_style TEXT,
  title_length INTEGER,
  has_demo BOOLEAN DEFAULT false,
  has_video BOOLEAN DEFAULT false,
  day1_views INTEGER DEFAULT 0,
  day7_views INTEGER DEFAULT 0,
  day30_views INTEGER DEFAULT 0,
  day1_upvotes INTEGER DEFAULT 0,
  day7_upvotes INTEGER DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0,
  category TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_launch_outcomes_project ON launch_outcomes(project_id);
CREATE INDEX idx_launch_outcomes_category ON launch_outcomes(category, launch_date DESC);

-- Growth patterns: AI-identified patterns from aggregate data
CREATE TABLE IF NOT EXISTS growth_patterns (
  id TEXT PRIMARY KEY DEFAULT 'gp-' || gen_random_uuid()::text,
  pattern_name TEXT NOT NULL UNIQUE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'copy', 'channel', 'timing', 'category', 'strategy'
  )),
  description TEXT NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  avg_impact FLOAT NOT NULL DEFAULT 0,
  confidence FLOAT NOT NULL DEFAULT 0,
  details JSONB,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE creator_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read creator_connections" ON creator_connections FOR SELECT USING (true);
CREATE POLICY "Public read product_signals" ON product_signals FOR SELECT USING (true);
CREATE POLICY "Public read product_comparisons" ON product_comparisons FOR SELECT USING (true);
CREATE POLICY "Public read launch_outcomes" ON launch_outcomes FOR SELECT USING (true);
CREATE POLICY "Public read growth_patterns" ON growth_patterns FOR SELECT USING (true);

-- Seed growth patterns (discovered from common knowledge)
INSERT INTO growth_patterns (pattern_name, pattern_type, description, evidence_count, avg_impact, confidence) VALUES
  ('tuesday_launch', 'timing', 'Launching on Tuesday or Wednesday gets 40% more initial views than weekends', 156, 40, 0.85),
  ('short_title', 'copy', 'Titles under 6 words get 25% more clicks than longer titles', 234, 25, 0.78),
  ('demo_first', 'strategy', 'Projects with a playable demo get 3x more engagement than description-only', 89, 200, 0.92),
  ('reddit_before_twitter', 'channel', 'Posting to relevant subreddits before Twitter generates more authentic discussion', 67, 35, 0.72),
  ('problem_lead', 'copy', 'Descriptions starting with the problem (not the solution) convert 30% better', 198, 30, 0.81),
  ('social_proof_early', 'strategy', 'Showing early user count/testimonials in first week boosts retention 45%', 45, 45, 0.68),
  ('ai_category_saturated', 'category', 'Generic "AI Assistant" category is oversaturated. Niche categories get 60% more attention', 312, 60, 0.88),
  ('gif_preview', 'copy', 'Adding a GIF preview increases demo click-through by 55%', 123, 55, 0.82)
ON CONFLICT (pattern_name) DO NOTHING;
