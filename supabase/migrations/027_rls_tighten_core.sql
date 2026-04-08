-- ═══════════════════════════════════════════════════════════════
-- RLS TIGHTEN: battle_history, ideas — require auth for writes
-- ═══════════════════════════════════════════════════════════════

-- battle_history: drop public insert, require auth
DROP POLICY IF EXISTS "Public insert battles" ON battle_history;
DROP POLICY IF EXISTS "Auth insert battles" ON battle_history;
CREATE POLICY "Auth insert battles"
  ON battle_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ideas: drop public insert, require auth + owner check
DROP POLICY IF EXISTS "Public insert ideas" ON ideas;
DROP POLICY IF EXISTS "Auth insert ideas" ON ideas;
CREATE POLICY "Auth insert ideas"
  ON ideas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ideas: add update policy (own + moderator/admin)
DROP POLICY IF EXISTS "Own update ideas" ON ideas;
CREATE POLICY "Own update ideas"
  ON ideas FOR UPDATE
  USING (
    auth.uid()::text = creator_name
    OR is_moderator_or_above(auth.uid())
  );

-- ideas: add delete policy (own + admin)
DROP POLICY IF EXISTS "Own delete ideas" ON ideas;
CREATE POLICY "Own delete ideas"
  ON ideas FOR DELETE
  USING (
    auth.uid()::text = creator_name
    OR is_admin(auth.uid())
  );
