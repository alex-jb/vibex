/**
 * POST /api/funeral/eulogize-idea
 *
 * Body: { idea_text, mourner_name?, mourner_email?, is_public?, handle? }
 * Returns: { id, eulogy, deceased_name, view_url, score?: { new, tier } }
 *
 * Companion to /api/funeral/eulogize. Same priest mechanic, no GitHub fetch.
 * Migration 066. Bumps creator score (surface=funeral_idea, delta 20).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { generateIdeaEulogy, generateAshImage } from "@/lib/funeral";
import { bumpScore } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Body {
  idea_text: string;
  mourner_name?: string;
  mourner_email?: string;
  is_public?: boolean;
  handle?: string;
}

function validate(body: unknown): Body | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const text = typeof b.idea_text === "string" ? b.idea_text.trim() : "";
  if (text.length < 20 || text.length > 500) return null;
  return {
    idea_text: text,
    mourner_name: typeof b.mourner_name === "string" ? b.mourner_name.slice(0, 100) : undefined,
    mourner_email: typeof b.mourner_email === "string" ? b.mourner_email.trim() : undefined,
    is_public: typeof b.is_public === "boolean" ? b.is_public : true,
    handle: typeof b.handle === "string" ? b.handle.slice(0, 64) : undefined,
  };
}

function hashIdea(t: string): string {
  return createHash("sha256").update(t.trim().toLowerCase()).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  const input = validate(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json(
      { error: "idea_text must be 20-500 characters" },
      { status: 400 },
    );
  }

  const ideaHash = hashIdea(input.idea_text);

  // 24h dedupe by idea_hash
  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    const { data: existing } = await supa
      .from("idea_funerals")
      .select("id, eulogy, deceased_name, ash_image_url, created_at")
      .eq("idea_hash", ideaHash)
      .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        id: existing.id,
        eulogy: existing.eulogy,
        deceased_name: existing.deceased_name,
        ash_image_url: existing.ash_image_url,
        view_url: `/funeral/idea/${existing.id}`,
        duplicate: true,
      });
    }
  }

  const result = await generateIdeaEulogy(input.idea_text, input.mourner_name);
  if (!result) {
    return NextResponse.json(
      {
        error:
          "The chapel is silent right now (Claude unavailable). Try again in a minute.",
      },
      { status: 503 },
    );
  }

  const ashPromise = generateAshImage(result.deceased_name, null).catch(() => null);

  let id: string | null = null;
  let ash_image_url: string | null = null;
  let scoreResult: { score: number; tier: string } | null = null;

  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    ash_image_url = await Promise.race([
      ashPromise,
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);

    const { data: inserted, error } = await supa
      .from("idea_funerals")
      .insert({
        idea_text: input.idea_text,
        idea_hash: ideaHash,
        deceased_name: result.deceased_name,
        category: result.category,
        age_when_buried: result.age_when_buried,
        eulogy: result.eulogy,
        cause_of_death: result.cause_of_death || "other",
        ash_image_url,
        mourner_email: input.mourner_email,
        mourner_name: input.mourner_name,
        is_public: input.is_public !== false,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[idea funeral] insert failed:", error);
    } else if (inserted) {
      id = inserted.id;

      // Bump creator score
      if (input.handle && id) {
        scoreResult = await bumpScore(supa, {
          handle: input.handle,
          surface: "funeral_idea",
          ref_id: id,
        });
      }
    }
  }

  return NextResponse.json({
    id,
    eulogy: result.eulogy,
    deceased_name: result.deceased_name,
    category: result.category,
    age_when_buried: result.age_when_buried,
    ash_image_url,
    view_url: id ? `/funeral/idea/${id}` : "",
    score: scoreResult,
  });
}
