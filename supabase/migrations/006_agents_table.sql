-- Agent definitions table for the VibeX agent marketplace
CREATE TABLE IF NOT EXISTS agent_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0.0',
  creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT '',
  system_prompt TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  tools TEXT[] NOT NULL DEFAULT '{}',
  input_schema JSONB NOT NULL DEFAULT '{"type":"text"}',
  output_schema JSONB NOT NULL DEFAULT '{"type":"text"}',
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  runs INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agent_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read agents" ON agent_definitions FOR SELECT USING (true);
CREATE POLICY "Auth insert agents" ON agent_definitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update agents" ON agent_definitions FOR UPDATE USING (true);

CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON agent_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
