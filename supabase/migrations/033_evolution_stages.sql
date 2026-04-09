-- 6-stage evolution system for project sprites
-- Evolution is auto-computed from metrics but stored for fast queries/sorting

-- Add evolution_stage column to projects
DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS evolution_stage text
    DEFAULT 'Seed'
    CHECK (evolution_stage IN ('Seed', 'Active', 'Growing', 'Breakout', 'Legend', 'Myth'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Index for filtering/sorting by evolution stage
CREATE INDEX IF NOT EXISTS idx_projects_evolution_stage ON projects (evolution_stage);

-- Function to auto-compute evolution stage from metrics
CREATE OR REPLACE FUNCTION compute_evolution_stage(
  p_plays int,
  p_upvotes int,
  p_views int,
  p_shares int,
  p_score int,
  p_originality int,
  p_investor_curiosity int
) RETURNS text AS $$
BEGIN
  IF p_plays >= 10000 AND p_upvotes >= 1000 AND p_investor_curiosity >= 80 AND p_score >= 90 THEN
    RETURN 'Myth';
  ELSIF p_plays >= 5000 AND p_upvotes >= 500 AND p_shares >= 200 AND p_score >= 85 THEN
    RETURN 'Legend';
  ELSIF p_plays >= 1000 AND p_upvotes >= 100 AND p_shares >= 50 AND p_originality >= 70 THEN
    RETURN 'Breakout';
  ELSIF p_plays >= 500 AND p_upvotes >= 50 AND p_views >= 1000 THEN
    RETURN 'Growing';
  ELSIF p_plays >= 50 OR p_score >= 40 THEN
    RETURN 'Active';
  ELSE
    RETURN 'Seed';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update evolution_stage when project metrics change
CREATE OR REPLACE FUNCTION update_project_evolution() RETURNS trigger AS $$
DECLARE
  v_originality int := 0;
  v_investor_curiosity int := 0;
BEGIN
  -- Fetch AI review scores
  SELECT COALESCE(originality, 0), COALESCE(investor_curiosity, 0)
  INTO v_originality, v_investor_curiosity
  FROM ai_reviews
  WHERE project_id = NEW.id
  LIMIT 1;

  NEW.evolution_stage := compute_evolution_stage(
    COALESCE(NEW.plays, 0),
    COALESCE(NEW.upvotes, 0),
    COALESCE(NEW.views, 0),
    COALESCE(NEW.shares, 0),
    COALESCE(NEW.score, 0),
    v_originality,
    v_investor_curiosity
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_evolution ON projects;
CREATE TRIGGER trg_update_evolution
  BEFORE INSERT OR UPDATE OF plays, upvotes, views, shares, score
  ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_evolution();
