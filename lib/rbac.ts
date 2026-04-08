import { createServerSupabase, getAuthUser } from "./supabase-server";

export type Role = "user" | "moderator" | "admin";

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
};

/**
 * Fetch the role for a given user ID from the database.
 * Returns "user" as the default if no role row exists.
 */
export async function getUserRole(userId: string): Promise<Role> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.rpc("get_user_role", { uid: userId });
  return (data as Role) ?? "user";
}

/**
 * Require at least a minimum role for the current authenticated user.
 *
 * Returns { user, role } on success, or a Response (401/403) on failure.
 * Usage in API routes:
 *
 *   const auth = await requireRole("moderator");
 *   if (auth instanceof Response) return auth;
 *   const { user, role } = auth;
 */
export async function requireRole(
  minRole: Role,
): Promise<{ user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>; role: Role } | Response> {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(user.id);
  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user, role };
}
