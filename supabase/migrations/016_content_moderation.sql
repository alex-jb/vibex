-- Content moderation: reports + post status

-- Report reasons
CREATE TABLE IF NOT EXISTS post_reports (
  id TEXT PRIMARY KEY DEFAULT 'report-' || gen_random_uuid()::text,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'nsfw', 'misinformation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(post_id, reporter_id)
);

CREATE INDEX idx_reports_status ON post_reports(status, created_at DESC);
CREATE INDEX idx_reports_post ON post_reports(post_id);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth insert reports" ON post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Own read reports" ON post_reports FOR SELECT USING (auth.uid() = reporter_id);

-- Post moderation status
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'active'
  CHECK (moderation_status IN ('active', 'flagged', 'hidden', 'removed'));

CREATE INDEX idx_posts_moderation ON posts(moderation_status) WHERE moderation_status != 'active';

-- Simple word filter list (expandable)
CREATE TABLE IF NOT EXISTS content_filters (
  id SERIAL PRIMARY KEY,
  pattern TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL DEFAULT 'flag' CHECK (action IN ('flag', 'block')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed basic filters
INSERT INTO content_filters (pattern, action) VALUES
  ('spam', 'flag'),
  ('scam', 'flag')
ON CONFLICT (pattern) DO NOTHING;
