-- ═══════════════════════════════════════════════════════════════
-- RLS: posts — add missing UPDATE and DELETE policies
-- ═══════════════════════════════════════════════════════════════

-- Own update: users can edit their own posts
DROP POLICY IF EXISTS "Own update posts" ON posts;
CREATE POLICY "Own update posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin/moderator update: for moderation status changes
DROP POLICY IF EXISTS "Mod update posts" ON posts;
CREATE POLICY "Mod update posts"
  ON posts FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Own delete: users can delete their own posts (drop old broad policy first)
DROP POLICY IF EXISTS "Own delete posts" ON posts;
CREATE POLICY "Own delete posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Admin delete: admins can remove any post
DROP POLICY IF EXISTS "Admin delete posts" ON posts;
CREATE POLICY "Admin delete posts"
  ON posts FOR DELETE
  USING (is_admin(auth.uid()));
