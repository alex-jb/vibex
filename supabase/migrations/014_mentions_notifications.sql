-- Mentions: stored as array on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_posts_mentions ON posts USING GIN (mentions);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'reaction', 'reply')),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own read notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Own update notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
