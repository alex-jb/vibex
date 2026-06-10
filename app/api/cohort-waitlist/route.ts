import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 200) {
    return NextResponse.redirect(new URL("/cohort?error=invalid", req.url), 303);
  }

  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (SUPA_URL && SUPA_ANON_KEY) {
    const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
    await supa
      .from("waitlist")
      .insert({ email, product: "pair-cohort", source: "landing" })
      .select()
      .maybeSingle();
  }

  return NextResponse.redirect(new URL("/cohort?ok=1#waitlist", req.url), 303);
}
