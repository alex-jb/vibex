CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT 'post-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_project ON posts(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_posts_parent ON posts(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_posts_trending ON posts(likes DESC, created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Auth insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete posts" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read post_likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Auth insert post_likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete post_likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE posts;
