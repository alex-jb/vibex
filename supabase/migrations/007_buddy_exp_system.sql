-- User EXP tracking
CREATE TABLE IF NOT EXISTS user_exp (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_exp INTEGER NOT NULL DEFAULT 0,
  daily_login_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User buddies collection
CREATE TABLE IF NOT EXISTS user_buddies (
  id TEXT PRIMARY KEY DEFAULT 'buddy-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_type_id TEXT NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  happiness INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_buddies_user ON user_buddies(user_id);

-- EXP history log
CREATE TABLE IF NOT EXISTS exp_log (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  exp_gained INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exp_log_user ON exp_log(user_id, created_at DESC);

ALTER TABLE user_exp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own read exp" ON user_exp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own update exp" ON user_exp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth insert exp" ON user_exp FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own read buddies" ON user_buddies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert buddies" ON user_buddies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update buddies" ON user_buddies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Own read exp_log" ON exp_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert exp_log" ON exp_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_exp_updated BEFORE UPDATE ON user_exp FOR EACH ROW EXECUTE FUNCTION update_updated_at();
