-- Public stub — full implementation is proprietary. See LICENSE.
-- This file documents the shape of `launch_feedback_actions` for the
-- Launch Feedback Loop (see docs/... and ceo-plans/launch-feedback-loop).
-- Real migration lives in .private/migrations/037_launch_feedback_actions.sql
-- and is run manually in the Supabase Dashboard SQL Editor.

-- ═══════════════════════════════════════════════════════════════
-- LAUNCH FEEDBACK ACTIONS
-- Each row = one actionable suggestion the AI review produced for
-- a project. The creator decides (apply/skip/reject); outcome_delta
-- is computed 72h after `applied_at` by a scheduled function.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS launch_feedback_actions (
  id               BIGSERIAL PRIMARY KEY,
  project_id       TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Groups actions from the same AI review call.
  review_id        TEXT NOT NULL,

  -- Stable within a review pass (UI reconciliation key).
  action_id        TEXT NOT NULL,

  -- Closed taxonomy: keep narrow so outcomes bucket cleanly.
  type             TEXT NOT NULL CHECK (type IN (
    'tagline_rewrite',
    'description_rewrite',
    'demo_add',
    'demo_quality',
    'audience_narrow',
    'cta_revamp',
    'tag_fix',
    'category_retarget',
    'thumbnail_upgrade',
    'pricing_clarify'
  )),

  severity         TEXT NOT NULL CHECK (severity IN (
    'must_fix',
    'should_try',
    'consider'
  )),

  rationale        TEXT NOT NULL,
  current_value    TEXT,
  suggested_values JSONB NOT NULL,

  success_metric   TEXT NOT NULL CHECK (success_metric IN (
    'upvotes','plays','shares','ctr','retention','remix_count'
  )),

  status           TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN (
    'suggested','applied','skipped','rejected','expired'
  )),

  applied_value    TEXT,
  applied_at       TIMESTAMPTZ,
  reject_reason    TEXT,

  outcome_delta    JSONB,   -- { metric, baseline, after, delta_pct, window_hours }
  outcome_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id, review_id, action_id)
);

CREATE INDEX IF NOT EXISTS idx_lfa_project_status
  ON launch_feedback_actions(project_id, status);

CREATE INDEX IF NOT EXISTS idx_lfa_pending_outcome
  ON launch_feedback_actions(applied_at)
  WHERE status = 'applied' AND outcome_delta IS NULL;

-- RLS: only the project's creator (via creators.auth_user_id) can touch
-- their own rows. Exact policies in .private migration.
ALTER TABLE launch_feedback_actions ENABLE ROW LEVEL SECURITY;
