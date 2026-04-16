import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * OAuth callback for Supabase. Handles the code-for-session exchange and,
 * crucially, writes the session cookies onto the outgoing redirect response
 * so the browser actually receives them.
 *
 * Previous version used createServerSupabase() which only writes cookies to
 * the request-scoped cookieStore. In Next.js 15+ Route Handlers, cookies
 * set that way do NOT always propagate to a NextResponse.redirect(...) — the
 * Set-Cookie header gets dropped. Symptom: user shows up in Supabase Auth
 * (server-side exchange succeeds) but has no sb-* cookies in the browser,
 * so middleware on the next protected route kicks them back to /login.
 *
 * Fix: build the response upfront and write cookies directly onto it via
 * response.cookies.set(). Belt-and-suspenders we also hit cookieStore so
 * any SSR reads in the same tick see the fresh session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";

  console.log("[auth/callback] origin:", origin, "code:", !!code, "redirectTo:", redirectTo);

  const response = NextResponse.redirect(`${origin}${redirectTo}`);

  if (!code) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("[auth/callback] missing supabase env");
    return response;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          // Write to both the cookie store (for same-request SSR reads) and
          // the outgoing response (so the browser actually gets Set-Cookie).
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Read-only contexts can throw — safe to ignore, response.cookies
            // below is the one that matters for the browser.
          }
          response.cookies.set({ name, value, ...options });
        }
      },
    },
  });

  try {
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

  return response;
}
