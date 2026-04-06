-- VibeX - Full Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ═══════════════════════════════════════════════════════════════
-- CREATORS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT NOT NULL DEFAULT '',
  rank INTEGER NOT NULL DEFAULT 0,
  weekly_growth NUMERIC(5,2) NOT NULL DEFAULT 0,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  badges TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('AI Agent', 'AI Tool', 'AI Game', 'AI Workflow', 'AI Utility', 'Experimental', 'Demo')),
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  plays INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  demo_type TEXT NOT NULL CHECK (demo_type IN ('chat', 'sandbox', 'preview', 'embedded')) DEFAULT 'preview',
  demo_url TEXT,
  demo_content TEXT,
  parent_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  viral_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_score ON projects(score DESC);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- BEHAVIOR SCORES (per project)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE behavior_scores (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  plays INTEGER NOT NULL DEFAULT 0,
  avg_stay_seconds NUMERIC(8,2) NOT NULL DEFAULT 0,
  share_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  compound NUMERIC(8,2) NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- AI REVIEWS (per project)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ai_reviews (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  originality INTEGER NOT NULL DEFAULT 0,
  clarity INTEGER NOT NULL DEFAULT 0,
  ux_potential INTEGER NOT NULL DEFAULT 0,
  virality_potential INTEGER NOT NULL DEFAULT 0,
  investor_curiosity INTEGER NOT NULL DEFAULT 0,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  weaknesses TEXT[] NOT NULL DEFAULT '{}',
  suggestions TEXT[] NOT NULL DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════
-- IDEAS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  creator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('idea', 'in-progress', 'launched')) DEFAULT 'idea',
  launched_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  -- AI evaluation fields (inline for simplicity)
  eval_viability INTEGER NOT NULL DEFAULT 0,
  eval_market_fit INTEGER NOT NULL DEFAULT 0,
  eval_competition TEXT NOT NULL CHECK (eval_competition IN ('low', 'moderate', 'high', 'saturated')) DEFAULT 'low',
  eval_uniqueness INTEGER NOT NULL DEFAULT 0,
  eval_difficulty TEXT NOT NULL CHECK (eval_difficulty IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'medium',
  eval_suggestions TEXT[] NOT NULL DEFAULT '{}',
  eval_similar_projects TEXT[] NOT NULL DEFAULT '{}',
  eval_estimated_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hackathon', 'salon', 'meetup', 'demo-day')),
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  top_project_ids TEXT[] NOT NULL DEFAULT '{}',
  ai_generated_topics TEXT[] NOT NULL DEFAULT '{}',
  participant_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TREND INSIGHTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE trend_insights (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rising', 'saturated', 'opportunity', 'emerging')),
  signal TEXT NOT NULL CHECK (signal IN ('strong', 'moderate', 'early')),
  summary TEXT NOT NULL DEFAULT '',
  momentum INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- WEEKLY WINNERS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE weekly_winners (
  id SERIAL PRIMARY KEY,
  week TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_weekly_winners_week ON weekly_winners(week);

-- ═══════════════════════════════════════════════════════════════
-- BATTLE HISTORY
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE battle_history (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  defender_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  winner_id TEXT NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]',
  exp_gained_challenger INTEGER NOT NULL DEFAULT 0,
  exp_gained_defender INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battles_challenger ON battle_history(challenger_id);
CREATE INDEX idx_battles_defender ON battle_history(defender_id);
CREATE INDEX idx_battles_created ON battle_history(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- FUNDING INFO (per project, optional)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE funding (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  goal INTEGER NOT NULL DEFAULT 0,
  raised INTEGER NOT NULL DEFAULT 0,
  donors INTEGER NOT NULL DEFAULT 0,
  vc_interest INTEGER NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_creators_updated BEFORE UPDATE ON creators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (basic - public read)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read" ON creators FOR SELECT USING (true);
CREATE POLICY "Public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read" ON behavior_scores FOR SELECT USING (true);
CREATE POLICY "Public read" ON ai_reviews FOR SELECT USING (true);
CREATE POLICY "Public read" ON ideas FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);
CREATE POLICY "Public read" ON trend_insights FOR SELECT USING (true);
CREATE POLICY "Public read" ON weekly_winners FOR SELECT USING (true);
CREATE POLICY "Public read" ON battle_history FOR SELECT USING (true);
CREATE POLICY "Public read" ON funding FOR SELECT USING (true);

-- Public insert for battle history (anyone can battle)
CREATE POLICY "Public insert battles" ON battle_history FOR INSERT WITH CHECK (true);

-- Public insert for ideas (anyone can submit)
CREATE POLICY "Public insert ideas" ON ideas FOR INSERT WITH CHECK (true);
