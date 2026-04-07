-- Post Reactions: 4 types (fire, game, art, mindblown)
-- Replaces simple binary likes with expressive reactions.

CREATE TABLE IF NOT EXISTS post_reactions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'game', 'art', 'mindblown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id, reaction_type)
);

CREATE INDEX idx_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_reactions_user ON post_reactions(user_id);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Auth insert reactions" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete reactions" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;

-- Toggle a reaction: insert if not exists, delete if exists.
-- Returns: { reacted: boolean, counts: { fire: N, game: N, art: N, mindblown: N } }
CREATE OR REPLACE FUNCTION toggle_reaction(p_post_id TEXT, p_user_id UUID, p_type TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_counts JSON;
BEGIN
  -- Validate type
  IF p_type NOT IN ('fire', 'game', 'art', 'mindblown') THEN
    RAISE EXCEPTION 'Invalid reaction type: %', p_type;
  END IF;

  -- Check if reaction exists
  SELECT EXISTS(
    SELECT 1 FROM post_reactions
    WHERE post_id = p_post_id AND user_id = p_user_id AND reaction_type = p_type
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM post_reactions
    WHERE post_id = p_post_id AND user_id = p_user_id AND reaction_type = p_type;
  ELSE
    INSERT INTO post_reactions (post_id, user_id, reaction_type)
    VALUES (p_post_id, p_user_id, p_type);
  END IF;

  -- Get updated counts for this post
  SELECT json_build_object(
    'fire', COALESCE(SUM(CASE WHEN reaction_type = 'fire' THEN 1 ELSE 0 END), 0),
    'game', COALESCE(SUM(CASE WHEN reaction_type = 'game' THEN 1 ELSE 0 END), 0),
    'art', COALESCE(SUM(CASE WHEN reaction_type = 'art' THEN 1 ELSE 0 END), 0),
    'mindblown', COALESCE(SUM(CASE WHEN reaction_type = 'mindblown' THEN 1 ELSE 0 END), 0)
  ) INTO v_counts
  FROM post_reactions
  WHERE post_id = p_post_id;

  RETURN json_build_object(
    'reacted', NOT v_exists,
    'type', p_type,
    'counts', COALESCE(v_counts, '{"fire":0,"game":0,"art":0,"mindblown":0}'::json)
  );
END;
$$;
