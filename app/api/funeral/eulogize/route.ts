/**
 * POST /api/funeral/eulogize
 *
 * Body: { github_url, mourner_name?, mourner_email?, is_public? }
 * Returns: { id, eulogy, ash_image_url, view_url }
 *
 * Spec: alex-brain research/2026-05-31-vibecoding-viral-tracks.md (track #1)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  parseGithubUrl,
  fetchRepoMeta,
  writeEulogy,
  generateAshImage,
} from "@/lib/funeral";
import { bumpScore } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface EulogizeBody {
  github_url: string;
  mourner_name?: string;
  mourner_email?: string;
  is_public?: boolean;
  handle?: string;
}

function validate(body: unknown): EulogizeBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const url = typeof b.github_url === "string" ? b.github_url.trim() : "";
  if (!url || !parseGithubUrl(url)) return null;
  return {
    github_url: url,
    mourner_name:
      typeof b.mourner_name === "string"
        ? b.mourner_name.slice(0, 100)
        : undefined,
    mourner_email:
      typeof b.mourner_email === "string" ? b.mourner_email.trim() : undefined,
    is_public: typeof b.is_public === "boolean" ? b.is_public : true,
    handle: typeof b.handle === "string" ? b.handle.slice(0, 64) : undefined,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const input = validate(body);
  if (!input) {
    return NextResponse.json(
      { error: "Missing or invalid github_url" },
      { status: 400 },
    );
  }

  // Check if this repo was already eulogized
  if (SUPA_URL && SUPA_ANON_KEY) {
    const parsed = parseGithubUrl(input.github_url)!;
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    const { data: existing } = await supa
      .from("funerals")
      .select("id, eulogy, ash_image_url")
      .eq("repo_owner", parsed.owner)
      .eq("repo_name", parsed.name)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        id: existing.id,
        eulogy: existing.eulogy,
        ash_image_url: existing.ash_image_url,
        view_url: `/funeral/${existing.id}`,
        duplicate: true,
      });
    }
  }

  const fetched = await fetchRepoMeta(input.github_url);
  if (!fetched.ok) {
    return NextResponse.json(
      { error: fetched.message, reason: fetched.reason },
      { status: fetched.reason === "still_alive" ? 409 : 400 },
    );
  }

  const meta = fetched.meta;
  const eulogy = await writeEulogy({
    meta,
    days_since_last_push: fetched.days_since_last_push,
    age_days_alive: fetched.age_days_alive,
    mourner_name: input.mourner_name,
  });

  // Generate ash image in background (don't block response)
  const ashImagePromise = generateAshImage(meta.name, meta.language).catch(
    () => null,
  );

  let id: string | null = null;
  let viewUrl = "";
  let ash_image_url: string | null = null;

  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    // Wait briefly for image (4s max — Vercel duration budget)
    ash_image_url = await Promise.race([
      ashImagePromise,
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);

    const parsed = parseGithubUrl(input.github_url)!;
    const { data: inserted, error } = await supa
      .from("funerals")
      .insert({
        github_url: meta.url || input.github_url,
        repo_owner: parsed.owner,
        repo_name: parsed.name,
        deceased_name: meta.name,
        deceased_at: meta.pushed_at?.slice(0, 10) || null,
        stars: meta.stars,
        forks: meta.forks,
        language: meta.language,
        commits_lifetime: 0,
        age_days_alive: fetched.age_days_alive,
        eulogy,
        ash_image_url,
        mourner_email: input.mourner_email,
        mourner_name: input.mourner_name,
        is_public: input.is_public !== false,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[funeral] insert failed:", error);
    } else if (inserted) {
      id = inserted.id;
      viewUrl = `/funeral/${id}`;
      // Bump creator score (surface=funeral_repo, delta scales with stars)
      if (input.handle && id) {
        await bumpScore(supa, {
          handle: input.handle,
          surface: "funeral_repo",
          ref_id: id,
          ctx: { stars: meta.stars },
          email: input.mourner_email,
        });
      }
    }
  }

  return NextResponse.json({
    id,
    eulogy,
    ash_image_url,
    view_url: viewUrl,
  });
}
