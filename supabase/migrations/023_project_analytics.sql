-- Project analytics: event tracking for views, clicks, shares

CREATE TABLE IF NOT EXISTS project_events (
  id TEXT PRIMARY KEY DEFAULT 'evt-' || gen_random_uuid()::text,
  project_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'share', 'upvote', 'demo_play')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_events_project ON project_events(project_id, event_type, created_at DESC);
CREATE INDEX idx_project_events_daily ON project_events(project_id, created_at);

ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert events" ON project_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read events" ON project_events FOR SELECT USING (true);

-- Aggregate view: daily stats per project
CREATE OR REPLACE VIEW project_daily_stats AS
SELECT
  project_id,
  DATE(created_at) as day,
  COUNT(*) FILTER (WHERE event_type = 'view') as views,
  COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE event_type = 'share') as shares,
  COUNT(*) FILTER (WHERE event_type = 'upvote') as upvotes,
  COUNT(*) FILTER (WHERE event_type = 'demo_play') as demo_plays
FROM project_events
GROUP BY project_id, DATE(created_at);
