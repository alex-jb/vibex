-- Agent Marketplace: reviews, ratings, install stats, version history

CREATE TABLE IF NOT EXISTS agent_reviews (
  id TEXT PRIMARY KEY DEFAULT 'review-' || gen_random_uuid()::text,
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

CREATE INDEX idx_agent_reviews_agent ON agent_reviews(agent_id, created_at DESC);

CREATE TABLE IF NOT EXISTS agent_installs (
  id TEXT PRIMARY KEY DEFAULT 'install-' || gen_random_uuid()::text,
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

CREATE TABLE IF NOT EXISTS agent_versions (
  id TEXT PRIMARY KEY DEFAULT 'ver-' || gen_random_uuid()::text,
  agent_id TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_versions ON agent_versions(agent_id, created_at DESC);

ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews" ON agent_reviews FOR SELECT USING (true);
CREATE POLICY "Auth insert reviews" ON agent_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete reviews" ON agent_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read installs count" ON agent_installs FOR SELECT USING (true);
CREATE POLICY "Auth insert installs" ON agent_installs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read versions" ON agent_versions FOR SELECT USING (true);
