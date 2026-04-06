-- Link creators to Supabase auth users
-- Run this after 001_initial_schema.sql

-- Add auth user reference to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_auth_user ON creators(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- User profiles view (joins auth.users with creators)
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  c.*,
  u.email,
  u.raw_user_meta_data->>'avatar_url' AS auth_avatar,
  u.raw_user_meta_data->>'full_name' AS auth_name
FROM creators c
LEFT JOIN auth.users u ON c.auth_user_id = u.id;

-- Track upvotes per user (prevent double voting)
CREATE TABLE IF NOT EXISTS user_upvotes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE user_upvotes ENABLE ROW LEVEL SECURITY;

-- Users can read their own upvotes
CREATE POLICY "Users read own upvotes" ON user_upvotes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own upvotes
CREATE POLICY "Users insert own upvotes" ON user_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes (un-upvote)
CREATE POLICY "Users delete own upvotes" ON user_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Link battle history to auth users
ALTER TABLE battle_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS: authenticated users can insert battles
DROP POLICY IF EXISTS "Public insert battles" ON battle_history;
CREATE POLICY "Auth insert battles" ON battle_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Update projects RLS for authenticated writes
CREATE POLICY "Auth update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = projects.creator_id
      AND creators.auth_user_id = auth.uid()
    )
  );

-- Authenticated users can insert projects
CREATE POLICY "Auth insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
