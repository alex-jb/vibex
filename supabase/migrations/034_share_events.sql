-- Share event tracking for social distribution analytics
CREATE TABLE IF NOT EXISTS share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('card_download', 'card_copy', 'link_copy', 'social_click', 'referral_visit')),
  platform text,
  referrer text,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_events_project ON share_events (project_id);
CREATE INDEX IF NOT EXISTS idx_share_events_type ON share_events (event_type);
CREATE INDEX IF NOT EXISTS idx_share_events_created ON share_events (created_at);

-- RLS: anyone can insert (anonymous share tracking)
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can track shares"
  ON share_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated read share events"
  ON share_events FOR SELECT
  TO authenticated
  USING (true);
