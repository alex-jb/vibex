-- Creator XP: earned from reactions on your posts
-- Level thresholds: 0=Noob, 100=Coder, 500=Builder, 2000=Master, 10000=Legend

CREATE TABLE IF NOT EXISTS creator_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "Own update profiles" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth insert profiles" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP award log: prevents double-awarding and enables daily caps
CREATE TABLE IF NOT EXISTS xp_awards (
  id TEXT PRIMARY KEY DEFAULT 'xp-' || gen_random_uuid()::text,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_awards_recipient ON xp_awards(recipient_id, created_at DESC);
CREATE INDEX idx_xp_awards_dedup ON xp_awards(actor_id, post_id, reaction_type);

ALTER TABLE xp_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read xp_awards" ON xp_awards FOR SELECT USING (true);

-- Award XP when a reaction is given.
-- Rules: no self-reaction XP, max 50 XP per actor per day, dedup by (actor, post, type)
CREATE OR REPLACE FUNCTION award_reaction_xp(
  p_recipient_id UUID,
  p_actor_id UUID,
  p_post_id TEXT,
  p_reaction_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_map JSON := '{"fire":10,"game":8,"art":8,"mindblown":15}'::JSON;
  v_xp INTEGER;
  v_daily_total INTEGER;
  v_new_xp INTEGER;
  v_level TEXT;
BEGIN
  -- No self-reaction XP
  IF p_recipient_id = p_actor_id THEN
    RETURN json_build_object('awarded', false, 'reason', 'self_reaction');
  END IF;

  -- Check dedup
  IF EXISTS(
    SELECT 1 FROM xp_awards
    WHERE actor_id = p_actor_id AND post_id = p_post_id AND reaction_type = p_reaction_type
  ) THEN
    RETURN json_build_object('awarded', false, 'reason', 'already_awarded');
  END IF;

  -- Daily cap: 50 XP per actor per day
  SELECT COALESCE(SUM(xp_amount), 0) INTO v_daily_total
  FROM xp_awards
  WHERE actor_id = p_actor_id
    AND created_at > NOW() - INTERVAL '1 day';

  IF v_daily_total >= 50 THEN
    RETURN json_build_object('awarded', false, 'reason', 'daily_cap');
  END IF;

  -- Get XP amount for this reaction type
  v_xp := (v_xp_map ->> p_reaction_type)::INTEGER;
  IF v_xp IS NULL THEN v_xp := 5; END IF;

  -- Insert award record
  INSERT INTO xp_awards (recipient_id, actor_id, post_id, reaction_type, xp_amount)
  VALUES (p_recipient_id, p_actor_id, p_post_id, p_reaction_type, v_xp);

  -- Upsert creator profile
  INSERT INTO creator_profiles (user_id, user_name, xp, updated_at)
  VALUES (p_recipient_id, 'User', v_xp, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET xp = creator_profiles.xp + v_xp, updated_at = NOW();

  -- Get new total XP
  SELECT xp INTO v_new_xp FROM creator_profiles WHERE user_id = p_recipient_id;

  -- Determine level
  v_level := CASE
    WHEN v_new_xp >= 10000 THEN 'Legend'
    WHEN v_new_xp >= 2000 THEN 'Master'
    WHEN v_new_xp >= 500 THEN 'Builder'
    WHEN v_new_xp >= 100 THEN 'Coder'
    ELSE 'Noob'
  END;

  RETURN json_build_object(
    'awarded', true,
    'xp_gained', v_xp,
    'total_xp', v_new_xp,
    'level', v_level
  );
END;
$$;
