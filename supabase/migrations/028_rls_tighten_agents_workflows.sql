-- ═══════════════════════════════════════════════════════════════
-- RLS TIGHTEN: workflows, agent_definitions — owner-scoped writes
-- ═══════════════════════════════════════════════════════════════

-- workflows: replace permissive insert/update with owner-scoped
DROP POLICY IF EXISTS "Auth insert workflows" ON workflows;
DROP POLICY IF EXISTS "Auth update workflows" ON workflows;
DROP POLICY IF EXISTS "Owner insert workflows" ON workflows;
DROP POLICY IF EXISTS "Owner update workflows" ON workflows;
DROP POLICY IF EXISTS "Owner delete workflows" ON workflows;

CREATE POLICY "Owner insert workflows"
  ON workflows FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id);

CREATE POLICY "Owner update workflows"
  ON workflows FOR UPDATE
  USING (auth.uid()::text = creator_id);

CREATE POLICY "Owner delete workflows"
  ON workflows FOR DELETE
  USING (
    auth.uid()::text = creator_id
    OR is_admin(auth.uid())
  );

-- agent_definitions: replace permissive insert/update with owner-scoped
DROP POLICY IF EXISTS "Auth insert agents" ON agent_definitions;
DROP POLICY IF EXISTS "Auth update agents" ON agent_definitions;
DROP POLICY IF EXISTS "Owner insert agents" ON agent_definitions;
DROP POLICY IF EXISTS "Owner update agents" ON agent_definitions;
DROP POLICY IF EXISTS "Owner delete agents" ON agent_definitions;

CREATE POLICY "Owner insert agents"
  ON agent_definitions FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id);

CREATE POLICY "Owner update agents"
  ON agent_definitions FOR UPDATE
  USING (auth.uid()::text = creator_id);

CREATE POLICY "Owner delete agents"
  ON agent_definitions FOR DELETE
  USING (
    auth.uid()::text = creator_id
    OR is_admin(auth.uid())
  );
