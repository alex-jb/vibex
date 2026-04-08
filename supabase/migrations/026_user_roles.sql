-- ═══════════════════════════════════════════════════════════════
-- USER ROLES — database-backed RBAC
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast role lookups
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles (needed for UI badges, admin checks)
CREATE POLICY "Anyone can read roles"
  ON user_roles FOR SELECT
  USING (true);

-- Only admins can insert/update/delete roles
CREATE POLICY "Admins manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: get_user_role(uuid) → text
-- SECURITY DEFINER so other RLS policies can call it without
-- circular permission issues.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM user_roles WHERE user_id = uid),
    'user'
  );
$$;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: is_admin(uuid) → boolean
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role(uid) = 'admin';
$$;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: is_moderator_or_above(uuid) → boolean
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_moderator_or_above(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role(uid) IN ('moderator', 'admin');
$$;
