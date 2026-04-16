import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";

  console.log("[auth/callback] origin:", origin, "code:", !!code, "redirectTo:", redirectTo);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("[auth/callback] env configured:", !!supabaseUrl, !!supabaseKey);

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = await createServerSupabase();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/callback] exchange error:", error.message, error.status);
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(error.message)}`,
          );
        }
        console.log(
          "[auth/callback] exchange OK user:",
          data?.user?.id,
          "email:",
          data?.user?.email,
        );
      } catch (e) {
        const msg = (e as Error)?.message ?? String(e);
        console.error("[auth/callback] unexpected error:", msg);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("auth_failed")}`,
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
