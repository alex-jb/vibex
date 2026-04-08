CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY DEFAULT 'wh-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL DEFAULT 'whsec_' || replace(gen_random_uuid()::text, '-', ''),
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id, created_at DESC);
CREATE INDEX idx_webhooks_user ON webhooks(user_id);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own read webhooks" ON webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own insert webhooks" ON webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update webhooks" ON webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own delete webhooks" ON webhooks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Own read webhook_logs" ON webhook_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM webhooks WHERE webhooks.id = webhook_logs.webhook_id AND webhooks.user_id = auth.uid())
);
