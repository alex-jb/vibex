import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
