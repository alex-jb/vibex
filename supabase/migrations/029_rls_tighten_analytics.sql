-- ═══════════════════════════════════════════════════════════════
-- RLS TIGHTEN: project_events, data moat tables, user_bans
-- ═══════════════════════════════════════════════════════════════

-- project_events: drop public insert, require auth
DROP POLICY IF EXISTS "Public insert events" ON project_events;
DROP POLICY IF EXISTS "Auth insert events" ON project_events;
CREATE POLICY "Auth insert events"
  ON project_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- data moat tables: admin-only write policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'creator_connections') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='creator_connections' AND policyname='Admin insert creator_connections') THEN
      EXECUTE 'CREATE POLICY "Admin insert creator_connections" ON creator_connections FOR INSERT WITH CHECK (is_admin(auth.uid()))';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='creator_connections' AND policyname='Admin update creator_connections') THEN
      EXECUTE 'CREATE POLICY "Admin update creator_connections" ON creator_connections FOR UPDATE USING (is_admin(auth.uid()))';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_signals') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='product_signals' AND policyname='Admin insert product_signals') THEN
      EXECUTE 'CREATE POLICY "Admin insert product_signals" ON product_signals FOR INSERT WITH CHECK (is_admin(auth.uid()))';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_comparisons') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='product_comparisons' AND policyname='Admin insert product_comparisons') THEN
      EXECUTE 'CREATE POLICY "Admin insert product_comparisons" ON product_comparisons FOR INSERT WITH CHECK (is_admin(auth.uid()))';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'launch_outcomes') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='launch_outcomes' AND policyname='Admin insert launch_outcomes') THEN
      EXECUTE 'CREATE POLICY "Admin insert launch_outcomes" ON launch_outcomes FOR INSERT WITH CHECK (is_admin(auth.uid()))';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'growth_patterns') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='growth_patterns' AND policyname='Admin insert growth_patterns') THEN
      EXECUTE 'CREATE POLICY "Admin insert growth_patterns" ON growth_patterns FOR INSERT WITH CHECK (is_admin(auth.uid()))';
    END IF;
  END IF;
END $$;

-- user_bans: restrict read to admin only (replace existing policy)
DROP POLICY IF EXISTS "Admin read bans" ON user_bans;
CREATE POLICY "Admin read bans"
  ON user_bans FOR SELECT
  USING (is_admin(auth.uid()));
