import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * VibeX auth middleware. Mirrors the canonical Supabase SSR proxy
 * (see github.com/supabase/supabase examples/auth/nextjs/lib/supabase/proxy.ts)
 * with VibeX-specific route gating layered on top.
 *
 * Critical pieces from the canonical pattern that MUST stay intact:
 *   1. createServerClient is built with cookie handlers that update both
 *      `request.cookies` and `supabaseResponse.cookies` so refreshed tokens
 *      land in the outgoing response.
 *   2. supabase.auth.getClaims() is called immediately after building the
 *      client. Per Supabase docs: "If you remove getClaims() and you use
 *      server-side rendering with the Supabase client, your users may be
 *      randomly logged out." Switching from getUser() to getClaims() was
 *      the bug fix on 2026-04-16 — getUser's network refresh was racing
 *      the cookie write and dropping the session.
 *   3. supabaseResponse must be returned for authenticated requests so any
 *      refreshed cookies reach the browser.
 */

// Page routes requiring an authenticated session
const AUTH_PAGE_ROUTES = [
  "/profile",
  "/settings",
  "/launch",
  "/messages",
  "/buddy",
];

// API routes requiring auth (write operations only — GET is public)
const AUTH_API_ROUTES = [
  "/api/feed",
  "/api/follows",
  "/api/comments",
  "/api/ideas",
  "/api/agents/run",
  "/api/workflows/run",
  "/api/buddy/interact",
];

// Moderator routes (view moderation queue)
const MODERATOR_ROUTES = ["/api/admin/moderation"];

// Admin-only routes (full admin panel, analytics, settings)
const ADMIN_ROUTES = ["/api/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const needsPage = AUTH_PAGE_ROUTES.some((r) => pathname.startsWith(r));
  const needsApi =
    AUTH_API_ROUTES.some((r) => pathname.startsWith(r)) && method !== "GET";
  const needsModerator = MODERATOR_ROUTES.some((r) => pathname.startsWith(r));
  const needsAdmin =
    !needsModerator && ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (!needsPage && !needsApi && !needsModerator && !needsAdmin) {
    return NextResponse.next();
  }

  // Dev-only bypass for screenshot/QA tooling. A request carrying
  // `vibex-screenshot-bypass=1` skips the auth gate so Playwright can
  // capture auth-only surfaces (/launch, /profile) against a localhost
  // dev server. NODE_ENV is `production` on Vercel, so this is inert
  // there. See scripts/screenshot-v3.mjs.
  if (
    process.env.NODE_ENV === "development" &&
    request.cookies.get("vibex-screenshot-bypass")?.value === "1"
  ) {
    return NextResponse.next();
  }

  // Graceful degradation when Supabase env isn't configured (local dev,
  // mock data mode). Let everything through.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run code between createServerClient and getClaims(). Per Supabase:
  // "A simple mistake could make it very hard to debug issues with users
  // being randomly logged out."
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    if (needsApi || needsAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role gate — moderator / admin paths
  if (needsModerator || needsAdmin) {
    const userId = claims.sub;
    const { data: role } = await supabase.rpc("get_user_role", { uid: userId });
    const userRole = role ?? "user";
    if (needsAdmin && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (needsModerator && userRole !== "admin" && userRole !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Return the supabaseResponse so any refreshed auth cookies reach the
  // browser. Returning a different response here will desync the session.
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/launch/:path*",
    "/messages/:path*",
    "/buddy/:path*",
    "/api/feed/:path*",
    "/api/follows/:path*",
    "/api/comments/:path*",
    "/api/ideas/:path*",
    "/api/agents/run/:path*",
    "/api/workflows/run/:path*",
    "/api/buddy/:path*",
    "/api/admin/:path*",
    "/api/admin/moderation/:path*",
  ],
};
