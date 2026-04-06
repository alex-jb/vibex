-- ═══════════════════════════════════════════════════════════════
-- SOCIAL FEATURES: Comments, Follows, Notifications
-- ═══════════════════════════════════════════════════════════════

-- ─── COMMENTS ───
CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT 'cmt-' || gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_project ON comments(project_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own delete comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comment likes (prevent double-like)
CREATE TABLE comment_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comment_likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Auth insert comment_likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete comment_likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ─── FOLLOWS ───
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Auth insert follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Own delete follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Add follower/following counts to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;

-- ─── NOTIFICATIONS ───
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT 'ntf-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('upvote', 'comment', 'reply', 'follow', 'battle', 'mention', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_name TEXT,
  actor_avatar TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own read notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Own update notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── USER PROFILES (extend creators) ───
ALTER TABLE creators ADD COLUMN IF NOT EXISTS total_followers INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_url TEXT;
