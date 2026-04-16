import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Browser-side Supabase client.
 *
 * Uses `createBrowserClient` from `@supabase/ssr` so the session is stored
 * in COOKIES (not localStorage) and the OAuth flow uses PKCE (code in
 * query param) instead of implicit (token in URL hash). This is critical
 * for SSR auth to work — server middleware reads from cookies, so the
 * browser must write to cookies too.
 *
 * The previous setup used `@supabase/supabase-js` createClient which
 * defaulted to localStorage + implicit flow. The result: OAuth completed
 * client-side (token in URL hash, parsed into localStorage) but the
 * server's /auth/callback was never invoked with a code, so cookies were
 * never written, and protected server routes (/launch, /profile, etc.)
 * couldn't see the user. Symptom: clicking Forge Project bounced back
 * to /login despite being "logged in" client-side.
 */
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? (createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient)
  : createMockClient();

/** Mock client that returns safe defaults for all operations */
function createMockClient(): SupabaseClient {
  const noopResult = { data: null, error: null };
  const noopPromise = () => Promise.resolve(noopResult);
  const noopSubscription = { unsubscribe: () => {} };

  const chainable: Record<string, unknown> = {};
  const methods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gt", "lt", "gte", "lte",
    "in", "is", "contains", "order", "limit", "range",
    "single", "maybeSingle", "or", "not", "filter",
  ];
  for (const m of methods) {
    chainable[m] = () => chainable;
  }
  chainable.then = (resolve: (v: unknown) => void) => Promise.resolve(noopResult).then(resolve);

  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithOAuth: noopPromise,
    signInWithPassword: noopPromise,
    signUp: noopPromise,
    signOut: noopPromise,
    onAuthStateChange: () => ({ data: { subscription: noopSubscription } }),
  };

  return new Proxy({} as SupabaseClient, {
    get: (_target, prop) => {
      if (prop === "auth") return mockAuth;
      if (prop === "from") return () => ({ ...chainable });
      if (prop === "rpc") return () => Promise.resolve(noopResult);
      if (prop === "channel") return () => {
        const ch: Record<string, unknown> = {};
        ch.on = () => ch;
        ch.subscribe = () => ch;
        ch.unsubscribe = () => {};
        return ch;
      };
      if (prop === "removeChannel") return () => {};
      return () => noopResult;
    },
  });
}
