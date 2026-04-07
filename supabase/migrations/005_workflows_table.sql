CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY DEFAULT 'wf-' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]',
  creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  runs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read workflows" ON workflows FOR SELECT USING (true);
CREATE POLICY "Auth insert workflows" ON workflows FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update workflows" ON workflows FOR UPDATE USING (true);

CREATE TRIGGER trg_workflows_updated BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();
