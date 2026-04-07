-- Hashtags: auto-extracted from post content, stored as array
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN (hashtags);

-- View: trending hashtags (top 20 by usage in last 7 days)
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT
  tag,
  COUNT(*) as post_count,
  MAX(p.created_at) as last_used
FROM posts p, unnest(p.hashtags) AS tag
WHERE p.created_at > NOW() - INTERVAL '7 days'
GROUP BY tag
ORDER BY post_count DESC, last_used DESC
LIMIT 20;
