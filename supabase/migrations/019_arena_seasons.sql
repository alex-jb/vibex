-- Arena: seasons, battle replays, spectator support

CREATE TABLE IF NOT EXISTS arena_seasons (
  id TEXT PRIMARY KEY DEFAULT 'season-' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS battle_replays (
  id TEXT PRIMARY KEY DEFAULT 'replay-' || gen_random_uuid()::text,
  battle_id TEXT NOT NULL,
  season_id TEXT REFERENCES arena_seasons(id),
  project_a_id TEXT NOT NULL,
  project_a_name TEXT NOT NULL,
  project_b_id TEXT NOT NULL,
  project_b_name TEXT NOT NULL,
  winner_id TEXT,
  rounds JSONB NOT NULL DEFAULT '[]',
  spectator_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replays_season ON battle_replays(season_id, created_at DESC);
CREATE INDEX idx_replays_projects ON battle_replays(project_a_id);

CREATE TABLE IF NOT EXISTS season_leaderboard (
  id TEXT PRIMARY KEY DEFAULT 'lb-' || gen_random_uuid()::text,
  season_id TEXT NOT NULL REFERENCES arena_seasons(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 1000,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(season_id, project_id)
);

CREATE INDEX idx_leaderboard_season ON season_leaderboard(season_id, rating DESC);

ALTER TABLE arena_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read seasons" ON arena_seasons FOR SELECT USING (true);
CREATE POLICY "Public read replays" ON battle_replays FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON season_leaderboard FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE battle_replays;

-- Seed current season
INSERT INTO arena_seasons (id, name, start_date, end_date, status) VALUES
  ('season-1', 'Season 1: Genesis', '2026-04-01', '2026-06-30', 'active')
ON CONFLICT (id) DO NOTHING;
