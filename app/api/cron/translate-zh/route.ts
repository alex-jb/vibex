/**
 * /api/cron/translate-zh — daily cron that fills missing _zh translations.
 *
 * Scans ideas + projects tables for rows where title_zh / tagline_zh /
 * description_zh are NULL and writes Chinese translations via
 * Claude Sonnet 4.6 (lib/translate-zh).
 *
 * Why: 2026-05-08. The /ideas page now uses idea.title_zh /
 * idea.description_zh when ZH toggle is on, with EN fallback. Mock
 * ideas have these populated by hand. Real creator submissions are
 * NULL → ZH users see English. This cron closes that loop.
 *
 * Cap: 50 rows per run (cost guard — 50 × ~$0.005 per translation =
 * ~$0.25/day at full saturation). Cron runs once daily so a backlog
 * of 200 new submissions takes 4 days to fully translate. ZH users
 * still get English fallback while waiting.
 *
 * Cron schedule: daily 03:00 UTC = 11am Beijing — caps run when most
 * Chinese users are awake to consume the freshly-translated content.
 *
 * Auth: CRON_SECRET-gated, service-role for writes (RLS on ideas +
 * projects requires owner context which cron doesn't have).
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { translateFields } from "@/lib/translate-zh";

export const runtime = "nodejs";
export const maxDuration = 60;

type IdeaMissing = {
  id: string;
  title: string;
  description: string;
  title_zh: string | null;
  description_zh: string | null;
};

type ProjectMissing = {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  title_zh: string | null;
  tagline_zh: string | null;
  description_zh: string | null;
};

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 500 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY missing" },
      { status: 500 },
    );
  }
  const supa = createClient(supabaseUrl, serviceRoleKey);

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);

  const results: Array<{ table: string; id: string; ok: boolean }> = [];

  // ── Ideas ──────────────────────────────────────────────────────
  const { data: ideas } = await supa
    .from("ideas")
    .select("id, title, description, title_zh, description_zh")
    .or("title_zh.is.null,description_zh.is.null")
    .order("created_at", { ascending: false })
    .limit(Math.floor(limit / 2));

  for (const row of (ideas || []) as IdeaMissing[]) {
    const fields: Record<string, string> = {};
    if (row.title_zh === null && row.title) fields.title = row.title;
    if (row.description_zh === null && row.description)
      fields.description = row.description;
    if (Object.keys(fields).length === 0) {
      results.push({ table: "ideas", id: row.id, ok: false });
      continue;
    }
    const translated = await translateFields(fields);
    if (!translated) {
      results.push({ table: "ideas", id: row.id, ok: false });
      continue;
    }
    const patch: Record<string, string> = {};
    if (translated.title) patch.title_zh = translated.title;
    if (translated.description) patch.description_zh = translated.description;
    const { error } = await supa.from("ideas").update(patch).eq("id", row.id);
    results.push({ table: "ideas", id: row.id, ok: !error });
  }

  // ── Projects ───────────────────────────────────────────────────
  const { data: projects } = await supa
    .from("projects")
    .select(
      "id, title, tagline, description, title_zh, tagline_zh, description_zh",
    )
    .or(
      "title_zh.is.null,tagline_zh.is.null,description_zh.is.null",
    )
    .order("created_at", { ascending: false })
    .limit(Math.floor(limit / 2));

  for (const row of (projects || []) as ProjectMissing[]) {
    const fields: Record<string, string> = {};
    if (row.title_zh === null && row.title) fields.title = row.title;
    if (row.tagline_zh === null && row.tagline) fields.tagline = row.tagline;
    if (row.description_zh === null && row.description)
      fields.description = row.description;
    if (Object.keys(fields).length === 0) {
      results.push({ table: "projects", id: row.id, ok: false });
      continue;
    }
    const translated = await translateFields(fields);
    if (!translated) {
      results.push({ table: "projects", id: row.id, ok: false });
      continue;
    }
    const patch: Record<string, string> = {};
    if (translated.title) patch.title_zh = translated.title;
    if (translated.tagline) patch.tagline_zh = translated.tagline;
    if (translated.description) patch.description_zh = translated.description;
    const { error } = await supa.from("projects").update(patch).eq("id", row.id);
    results.push({ table: "projects", id: row.id, ok: !error });
  }

  return NextResponse.json({
    candidate_count: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
