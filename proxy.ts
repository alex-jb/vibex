import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Page routes requiring an authenticated session
const AUTH_ROUTES = [
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

  // --- Determine whether this route needs auth ---
  const needsPageAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const needsApiAuth =
    AUTH_API_ROUTES.some((r) => pathname.startsWith(r)) && method !== "GET";
  const needsModerator = MODERATOR_ROUTES.some((r) => pathname.startsWith(r));
  const needsAdmin = !needsModerator && ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  // Nothing to protect — pass through immediately
  if (!needsPageAuth && !needsApiAuth && !needsModerator && !needsAdmin) {
    return NextResponse.next();
  }

  // --- Graceful degradation: skip auth when Supabase is not configured ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Dev mode without Supabase — let everything through
    return NextResponse.next();
  }

  // --- Validate session via Supabase SSR (getUser contacts auth server) ---
  const { createMiddlewareClient } = await import("@/lib/supabase-server");
  const { supabase, ctx } = createMiddlewareClient(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // API / admin routes get a 401 JSON response (no redirect)
    if (needsApiAuth || needsAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Page routes redirect to login with a return-to param
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Role gate (moderator / admin) ---
  if (needsModerator || needsAdmin) {
    const { data: role } = await supabase.rpc("get_user_role", { uid: user.id });
    const userRole = role ?? "user";

    if (needsAdmin && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (needsModerator && userRole !== "admin" && userRole !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Authenticated (and authorized if admin) — return the response which
  // carries any refreshed auth cookies written by the Supabase client.
  return ctx.response;
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
