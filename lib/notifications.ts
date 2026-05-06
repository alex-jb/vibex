/**
 * Server-side helper for inserting notifications. Used by upvote /
 * follow / comment / stage-evolution paths to drop a row into the
 * `notifications` table that the realtime subscription in
 * components/notification-bell.tsx + notification-toast.tsx will surface.
 *
 * All inserts are fire-and-forget — never throw to the caller, since
 * notification failure must never cascade into a 500 on the user
 * action that triggered it. Errors land in console.error for Sentry.
 *
 * Schema is consolidated by migration 050. Required columns:
 *   id, user_id, type, actor_name, action_text, target_url,
 *   project_id, read, created_at.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType =
  | "upvote"
  | "comment"
  | "reply"
  | "follow"
  | "battle"
  | "system"
  | "mention"
  | "reaction"
  | "challenge"
  | "ranking"
  | "streak"
  | "stage_evolution"
  | "project_milestone";

export interface NotificationInsert {
  /** auth.users.id of the user who should RECEIVE the notification. */
  recipientUserId: string;
  type: NotificationType;
  /** Display name of the user (or system) who triggered the action. */
  actorName: string;
  /** Human-readable summary, e.g. 'upvoted your project "X"'. */
  actionText: string;
  /** Click destination, e.g. /project/abc. */
  targetUrl?: string;
  /** When the notification is project-scoped. */
  projectId?: string;
}

export async function insertNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any, "public", any>,
  n: NotificationInsert,
): Promise<void> {
  try {
    const { error } = await client.from("notifications").insert({
      user_id: n.recipientUserId,
      type: n.type,
      actor_name: n.actorName,
      action_text: n.actionText,
      target_url: n.targetUrl ?? null,
      project_id: n.projectId ?? null,
      read: false,
    });
    if (error) {
      console.error("[notifications] insert failed", error);
    }
  } catch (err) {
    console.error("[notifications] insert threw", err);
  }
}

/**
 * Look up the auth user_id of the creator who owns a given project.
 * Returns null if the project doesn't exist or the creator has no
 * auth_user_id link (legacy creators created before migration 003).
 */
export async function getProjectOwnerAuthId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any, "public", any>,
  projectId: string,
): Promise<{ authUserId: string; projectTitle: string } | null> {
  const { data } = await client
    .from("projects")
    .select("title, creator_id, creators!inner(auth_user_id)")
    .eq("id", projectId)
    .maybeSingle();
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (data as any).creators;
  const authUserId =
    Array.isArray(c) ? c[0]?.auth_user_id : c?.auth_user_id;
  if (!authUserId) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { authUserId, projectTitle: (data as any).title };
}
