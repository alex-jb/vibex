/**
 * Unified data adapter — collapses USE_SUPABASE branches into one interface.
 * Features import from here and never check USE_SUPABASE themselves.
 */

export const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
