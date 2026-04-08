-- ═══════════════════════════════════════════════════════════════
-- RLS: posts — add missing UPDATE and DELETE policies
-- ═══════════════════════════════════════════════════════════════

-- Own update: users can edit their own posts
CREATE POLICY "Own update posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin/moderator update: for moderation status changes
CREATE POLICY "Mod update posts"
  ON posts FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Own delete: users can delete their own posts
CREATE POLICY "Own delete posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Admin delete: admins can remove any post
CREATE POLICY "Admin delete posts"
  ON posts FOR DELETE
  USING (is_admin(auth.uid()));
