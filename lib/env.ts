export function validateEnv() {
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL not set - using mock data");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY not set - using mock data");
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push("ANTHROPIC_API_KEY not set - AI features disabled");
  }

  if (warnings.length > 0) {
    console.warn("\n\u26a0\ufe0f  VibeX Environment Warnings:");
    warnings.forEach(w => console.warn(`   - ${w}`));
    console.warn("");
  }

  return {
    hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasAI: !!process.env.ANTHROPIC_API_KEY,
  };
}
