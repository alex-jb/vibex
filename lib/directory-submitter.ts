/**
 * Directory submission module — shared types + queue runner.
 *
 * Spec: docs/superpowers/specs/2026-05-14-directory-submission-design.md
 *
 * Each adapter is a thin module exporting `submit(project, deps) → SubmissionResult`.
 * The queue runner picks `status='queued'` rows from `directory_submissions`,
 * dispatches to the matching adapter by `directory_key`, and writes the
 * result back. Designed to be idempotent: re-running on the same row is
 * safe; UNIQUE(project_id, directory_key) prevents duplicates.
 *
 * Cron drives the queue at /api/cron/process-directory-queue every 5min.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type DirectoryKey = "dev-to" | "github-awesome-mcp";

export type SubmissionStatus =
  | "queued"
  | "submitted"
  | "approved"
  | "rejected"
  | "failed";

export interface DirectoryAdapterProjectInput {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl?: string | null;
  thumbnail?: string | null;
  creatorName?: string | null;
}

export interface SubmissionResult {
  status: Exclude<SubmissionStatus, "queued">;
  externalId?: string;
  externalUrl?: string;
  errorMessage?: string;
}

export interface DirectoryAdapter {
  key: DirectoryKey;
  /** Human label for UI + admin logs. */
  label: string;
  /** Is the env / credential set up for this adapter to run? */
  isAvailable(): boolean;
  /** Run the submission. Adapters must throw on hard failures (we catch + mark 'failed'). */
  submit(project: DirectoryAdapterProjectInput): Promise<SubmissionResult>;
}

/**
 * Tier-1 adapters that are safe to auto-run (ToS-clean):
 *   - dev.to → public Articles API, automation explicitly permitted
 *   - GitHub awesome-list PRs → public-repo octokit, normal contribution flow
 *
 * NOT included (deferred until ToS read):
 *   - Toolify, Futurepedia, TAAFT, AlternativeTo (form-POST sites, ambiguous ToS)
 *   - Product Hunt API (one-launch-per-24h, too high-stakes to auto)
 *
 * Adapters self-register here so the queue runner has a single source of truth.
 */
export async function loadAdapters(): Promise<DirectoryAdapter[]> {
  const [{ devToAdapter }, { githubAwesomeAdapter }] = await Promise.all([
    import("@/lib/directories/dev-to"),
    import("@/lib/directories/github-awesome"),
  ]);
  return [devToAdapter, githubAwesomeAdapter];
}

/**
 * Queue 1+ submissions for a project. Idempotent thanks to the table's
 * UNIQUE(project_id, directory_key) constraint — re-clicking the opt-in
 * button doesn't double-row.
 */
export async function enqueueSubmissions(
  supabase: SupabaseClient,
  projectId: string,
  directoryKeys: DirectoryKey[],
): Promise<{ inserted: number; alreadyQueued: number }> {
  let inserted = 0;
  let alreadyQueued = 0;
  for (const key of directoryKeys) {
    const { error } = await supabase
      .from("directory_submissions")
      .insert({ project_id: projectId, directory_key: key, status: "queued" });
    if (!error) {
      inserted++;
    } else if (error.code === "23505") {
      alreadyQueued++;
    } else {
      console.warn(`[directory-submitter] enqueue failed for ${key}`, error);
    }
  }
  return { inserted, alreadyQueued };
}

/**
 * Cron-driven runner. Picks all `queued` or `failed` (with retry_count < 3)
 * rows + their project, dispatches each to its adapter, writes result back.
 * Returns a summary for cron logs.
 *
 * Pass a service-role client so RLS doesn't block status UPDATEs.
 */
export async function processQueue(
  adminSupabase: SupabaseClient,
  opts: { batchSize?: number } = {},
): Promise<{
  processed: number;
  byStatus: Record<string, number>;
}> {
  const batchSize = opts.batchSize ?? 20;
  const adapters = await loadAdapters();
  const adapterByKey = new Map(adapters.map((a) => [a.key, a]));

  const { data: rows, error } = await adminSupabase
    .from("directory_submissions")
    .select("id, project_id, directory_key, retry_count, status")
    .in("status", ["queued", "failed"])
    .lt("retry_count", 3)
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) throw new Error(`[directory-submitter] queue read failed: ${error.message}`);
  if (!rows || rows.length === 0) {
    return { processed: 0, byStatus: {} };
  }

  // Hydrate projects in one query.
  const projectIds = Array.from(new Set(rows.map((r) => r.project_id)));
  const { data: projects, error: projErr } = await adminSupabase
    .from("projects")
    .select("id, title, tagline, description, category, tags, demo_url, thumbnail, creator_name")
    .in("id", projectIds);

  if (projErr) throw new Error(`[directory-submitter] project read failed: ${projErr.message}`);
  const projectById = new Map(
    (projects ?? []).map((p) => [p.id, p as Record<string, unknown>]),
  );

  const byStatus: Record<string, number> = {};
  for (const row of rows) {
    const adapter = adapterByKey.get(row.directory_key as DirectoryKey);
    const project = projectById.get(row.project_id);

    if (!adapter || !project) {
      await markResult(adminSupabase, row.id, {
        status: "failed",
        errorMessage: !adapter
          ? `unknown directory_key: ${row.directory_key}`
          : `project ${row.project_id} no longer exists`,
      }, row.retry_count);
      byStatus.failed = (byStatus.failed ?? 0) + 1;
      continue;
    }

    if (!adapter.isAvailable()) {
      await markResult(adminSupabase, row.id, {
        status: "failed",
        errorMessage: `${adapter.label} not configured (env missing)`,
      }, row.retry_count);
      byStatus.failed = (byStatus.failed ?? 0) + 1;
      continue;
    }

    try {
      const result = await adapter.submit({
        id: project.id as string,
        title: project.title as string,
        tagline: project.tagline as string,
        description: project.description as string,
        category: project.category as string,
        tags: (project.tags as string[]) ?? [],
        demoUrl: (project.demo_url as string | null) ?? null,
        thumbnail: (project.thumbnail as string | null) ?? null,
        creatorName: (project.creator_name as string | null) ?? null,
      });
      await markResult(adminSupabase, row.id, result, row.retry_count);
      byStatus[result.status] = (byStatus[result.status] ?? 0) + 1;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await markResult(adminSupabase, row.id, {
        status: "failed",
        errorMessage: msg,
      }, row.retry_count);
      byStatus.failed = (byStatus.failed ?? 0) + 1;
    }
  }

  return { processed: rows.length, byStatus };
}

async function markResult(
  adminSupabase: SupabaseClient,
  id: string,
  result: SubmissionResult,
  priorRetry: number,
): Promise<void> {
  const patch: Record<string, unknown> = {
    status: result.status,
    error_message: result.errorMessage ?? null,
    external_id: result.externalId ?? null,
    external_url: result.externalUrl ?? null,
  };
  if (result.status === "submitted" || result.status === "approved") {
    patch.submitted_at = new Date().toISOString();
  }
  if (result.status === "approved") {
    patch.approved_at = new Date().toISOString();
  }
  if (result.status === "failed") {
    patch.retry_count = priorRetry + 1;
  }
  const { error } = await adminSupabase
    .from("directory_submissions")
    .update(patch)
    .eq("id", id);
  if (error) {
    console.error(`[directory-submitter] markResult UPDATE failed for ${id}`, error);
  }
}
