import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Create a per-request Supabase client with cookie-based auth.
 * Use this in API routes and server components for authenticated operations.
 *
 *   const supabase = await createServerSupabase();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll can fail in Server Components (read-only).
            // Safe to ignore — session refresh happens on next request.
          }
        },
      },
    },
  );
}

/**
 * Creates a Supabase client configured for Next.js middleware.
 * Uses getAll/setAll cookie methods (required by @supabase/ssr v0.10+).
 * The setAll handler also applies cache-control headers provided by the
 * library to prevent CDN/proxy caching of responses that carry auth cookies.
 */
export function createMiddlewareClient(request: NextRequest) {
  // Wrapped in an object so the `setAll` callback can replace the response
  // and the caller always reads the latest instance via `ctx.response`.
  const ctx = {
    response: NextResponse.next({
      request: { headers: request.headers },
    }),
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Update request cookies so downstream handlers see fresh values
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Rebuild the response so it carries the updated request headers
          ctx.response = NextResponse.next({
            request: { headers: request.headers },
          });

          // Write each cookie onto the outgoing response
          cookiesToSet.forEach(({ name, value, options }) => {
            ctx.response.cookies.set(name, value, options);
          });

          // Apply cache-control headers from the library to prevent
          // CDN/proxy caching of responses that set auth cookies
          Object.entries(headers).forEach(([key, val]) => {
            ctx.response.headers.set(key, val);
          });
        },
      },
    },
  );

  return { supabase, ctx };
}

/**
 * Helper: extract authenticated user or return null.
 * Returns the user object if authenticated, null otherwise.
 */
export async function getAuthUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
