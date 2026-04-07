-- Buddy Evolution: new forms, interactions (feed/train), trading

-- Evolution chains: buddy_type_id -> evolved_form_id at certain levels
CREATE TABLE IF NOT EXISTS buddy_evolutions (
  id TEXT PRIMARY KEY DEFAULT 'evo-' || gen_random_uuid()::text,
  base_type_id TEXT NOT NULL,
  evolved_type_id TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  required_affinity INTEGER NOT NULL DEFAULT 0,
  evolution_name TEXT NOT NULL,
  evolution_name_zh TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buddy interactions: feed, train, play (earns affinity)
CREATE TABLE IF NOT EXISTS buddy_interactions (
  id TEXT PRIMARY KEY DEFAULT 'interact-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('feed', 'train', 'play')),
  affinity_gained INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buddy_interactions_user ON buddy_interactions(user_id, buddy_id, created_at DESC);

-- Buddy trading: listings and trades
CREATE TABLE IF NOT EXISTS buddy_trades (
  id TEXT PRIMARY KEY DEFAULT 'trade-' || gen_random_uuid()::text,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buddy_id TEXT NOT NULL,
  buddy_type_id TEXT NOT NULL,
  buddy_name TEXT NOT NULL,
  buddy_level INTEGER NOT NULL,
  price_xp INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at TIMESTAMPTZ
);

CREATE INDEX idx_buddy_trades_status ON buddy_trades(status, created_at DESC);

ALTER TABLE buddy_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read evolutions" ON buddy_evolutions FOR SELECT USING (true);
CREATE POLICY "Own read interactions" ON buddy_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert interactions" ON buddy_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read trades" ON buddy_trades FOR SELECT USING (true);
CREATE POLICY "Auth insert trades" ON buddy_trades FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Own update trades" ON buddy_trades FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Seed evolution chains
INSERT INTO buddy_evolutions (base_type_id, evolved_type_id, required_level, required_affinity, evolution_name, evolution_name_zh) VALUES
  ('pixel-fox', 'pixel-fox-mega', 10, 50, 'MegaFox', '超级狐'),
  ('glitch-cat', 'glitch-cat-mega', 10, 50, 'MegaCat', '超级猫'),
  ('retro-dragon', 'retro-dragon-mega', 15, 80, 'MegaDragon', '超级龙'),
  ('cyber-owl', 'cyber-owl-mega', 10, 50, 'MegaOwl', '超级鸮'),
  ('data-slime', 'data-slime-mega', 10, 50, 'MegaSlime', '超级史莱姆')
ON CONFLICT (id) DO NOTHING;
