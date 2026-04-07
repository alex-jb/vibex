-- User bans: ban/unban with reason and duration

CREATE TABLE IF NOT EXISTS user_bans (
  id TEXT PRIMARY KEY DEFAULT 'ban-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,  -- NULL = permanent
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_bans_user ON user_bans(user_id, created_at DESC);
CREATE INDEX idx_bans_active ON user_bans(user_id) WHERE lifted_at IS NULL;

ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read bans" ON user_bans FOR SELECT USING (true);

-- Check if a user is currently banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_bans
    WHERE user_id = p_user_id
      AND lifted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;
