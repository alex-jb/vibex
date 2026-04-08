-- Algorithmic feed: engagement-weighted ranking with time decay
--
-- Score formula:
--   score = (reactions_weighted + replies*3 + likes*1) / (age_hours + 2)^1.5
--
-- This is a simplified Hacker News-style ranking where:
--   - Recent posts get a boost (time decay denominator)
--   - Reactions are weighted by type (mindblown=15, fire=10, game=8, art=8)
--   - Replies count 3x (engagement signal)
--   - The +2 prevents division by zero and gives new posts a window

CREATE OR REPLACE FUNCTION feed_score(
  p_likes INTEGER,
  p_replies INTEGER,
  p_created_at TIMESTAMPTZ,
  p_reaction_fire BIGINT DEFAULT 0,
  p_reaction_game BIGINT DEFAULT 0,
  p_reaction_art BIGINT DEFAULT 0,
  p_reaction_mindblown BIGINT DEFAULT 0
)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_engagement FLOAT;
  v_age_hours FLOAT;
BEGIN
  v_engagement := (
    p_reaction_fire * 10 +
    p_reaction_game * 8 +
    p_reaction_art * 8 +
    p_reaction_mindblown * 15 +
    p_replies * 3 +
    p_likes * 1
  );

  v_age_hours := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600.0;

  RETURN v_engagement / POWER(v_age_hours + 2, 1.5);
END;
$$;

-- Materialized view: pre-computed trending feed (refresh periodically)
-- For now we'll use a regular view since traffic is low
CREATE OR REPLACE VIEW algorithmic_feed AS
SELECT
  p.*,
  COALESCE(rc.fire, 0) as reaction_fire,
  COALESCE(rc.game, 0) as reaction_game,
  COALESCE(rc.art, 0) as reaction_art,
  COALESCE(rc.mindblown, 0) as reaction_mindblown,
  feed_score(
    p.likes,
    p.replies_count,
    p.created_at,
    COALESCE(rc.fire, 0),
    COALESCE(rc.game, 0),
    COALESCE(rc.art, 0),
    COALESCE(rc.mindblown, 0)
  ) as score
FROM posts p
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE reaction_type = 'fire') as fire,
    COUNT(*) FILTER (WHERE reaction_type = 'game') as game,
    COUNT(*) FILTER (WHERE reaction_type = 'art') as art,
    COUNT(*) FILTER (WHERE reaction_type = 'mindblown') as mindblown
  FROM post_reactions pr
  WHERE pr.post_id = p.id
) rc ON true
WHERE p.parent_id IS NULL
  AND p.moderation_status IN ('active', 'flagged')
ORDER BY score DESC;
