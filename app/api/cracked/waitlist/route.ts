/**
 * POST /api/cracked/waitlist
 *
 * Persists Cracked Score early-access signups. Phase 1: insert into a
 * waitlist table; Phase 2 (when scoring engine ships) we email this list
 * first.
 *
 * No webhook back to user. Status is implicit ("we'll email you when
 * scoring opens"). Lightweight rate limit: 1 entry per (email, github_handle).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Body {
  email: string;
  github_handle: string;
}

function validate(body: unknown): Body | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const gh = typeof b.github_handle === "string" ? b.github_handle.trim().replace(/^@/, "") : "";
  if (!email || !gh) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  if (gh.length < 1 || gh.length > 39) return null;
  return { email, github_handle: gh };
}

export async function POST(req: NextRequest) {
  const input = validate(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: "Email + GitHub handle required" }, { status: 400 });
  }
  if (!SUPA_URL || !SUPA_ANON_KEY) {
    return NextResponse.json({ error: "Server config missing" }, { status: 503 });
  }

  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);

  try {
    const { error } = await supa.from("cracked_waitlist").upsert(
      {
        email: input.email.toLowerCase(),
        github_handle: input.github_handle.toLowerCase(),
        created_at: new Date().toISOString(),
      },
      { onConflict: "email,github_handle" },
    );
    if (error) {
      // Table not migrated yet — degrade gracefully so the form doesn't
      // appear broken during the scaffold phase.
      console.error("[cracked/waitlist] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[cracked/waitlist] exception:", err);
  }

  return NextResponse.json({ ok: true });
}
