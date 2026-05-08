import Link from "next/link";
import { DEMO_DRAFTS, DEMO_PROJECT } from "@/lib/demo-drafts";

export const metadata = {
  title: "Try VibeXForge — see 6 sample drafts (no signup)",
  description:
    "See 6 platform-native drafts VibeXForge generated for itself — X, Hacker News, Reddit, Xiaohongshu, LinkedIn — before you sign in.",
};

const PLATFORM_LABEL: Record<string, string> = {
  x: "X (Twitter)",
  reddit: "Reddit",
  hacker_news: "Hacker News",
  linkedin: "LinkedIn",
  xiaohongshu: "Xiaohongshu (小红书)",
  jike: "Jike (即刻)",
  bluesky: "Bluesky",
  threads: "Threads",
  dev_to: "Dev.to",
  producthunt: "Product Hunt",
};

const PLATFORM_ACCENT: Record<string, string> = {
  x: "#000",
  reddit: "#FF4500",
  hacker_news: "#FF6600",
  linkedin: "#0A66C2",
  xiaohongshu: "#FE2C55",
  jike: "#FFD200",
};

export default function TryPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      {/* Hero */}
      <section className="px-6 pt-24 pb-16 max-w-5xl mx-auto">
        <p
          className="font-pixel text-[10px] uppercase tracking-[0.28em] mb-4"
          style={{ color: "#FF4500" }}
        >
          ▸ NO SIGNUP · REAL DRAFTS · GENERATED FROM VIBEXFORGE.COM
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
          See what you&apos;d get,
          <br />
          <span style={{ color: "#FF4500" }}>before you sign in.</span>
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mb-6 leading-relaxed">
          Below are 6 actual drafts VibeXForge generated for itself
          (vibexforge.com) in ~10 seconds. Each one is written for that
          platform&apos;s specific tone, length, and hook conventions. No
          translation, no copy-paste. Bilingual EN ↔ ZH from one submit.
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/launch" className="btn-primary btn-primary-lg">
            Generate for YOUR project →
          </Link>
          <Link href="/how-it-works" className="btn-ghost btn-ghost-lg">
            How it works
          </Link>
        </div>
        <p className="text-xs text-foreground/40">
          Free during beta · No credit card · {DEMO_DRAFTS.length} of 17 drafts
          shown below — sign in to see the full set generated for your URL.
        </p>
      </section>

      {/* Sample drafts */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="space-y-5">
          {DEMO_DRAFTS.map((d, i) => {
            const accent = PLATFORM_ACCENT[d.platform] || "#FF4500";
            return (
              <article
                key={i}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02]"
              >
                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-wrap">
                  <span
                    className="font-pixel text-[11px] uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    {PLATFORM_LABEL[d.platform] || d.platform}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-foreground/70 font-mono">
                    {d.language.toUpperCase()}
                  </span>
                  {d.variant_key && (
                    <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono">
                      {d.variant_key}
                    </span>
                  )}
                  <span className="text-xs text-foreground/40 font-mono ml-auto">
                    {d.length} chars
                  </span>
                </div>
                <div className="px-5 py-4">
                  {d.title && (
                    <p className="font-bold text-foreground mb-3 text-sm">
                      {d.title}
                    </p>
                  )}
                  <pre className="text-sm text-foreground/85 whitespace-pre-wrap font-sans leading-relaxed">
                    {d.body}
                  </pre>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-28 max-w-3xl mx-auto text-center border-t border-white/[0.06]">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
          Like what you read? Get 17 of these for your project.
        </h2>
        <p className="text-foreground/60 mb-8 leading-relaxed">
          Same loop. URL in, 17 platform-native drafts out, ~10 seconds. Edit,
          approve, one-click publish. Free during beta.
        </p>
        <Link href="/launch" className="btn-primary btn-primary-lg">
          Submit your AI project →
        </Link>
        <p className="text-xs text-foreground/30 mt-8">
          Source URL for these samples:{" "}
          <a
            href={DEMO_PROJECT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 hover:underline"
          >
            {DEMO_PROJECT.url}
          </a>
          {" · "}
          generated {DEMO_PROJECT.generated_at}
        </p>
      </section>
    </main>
  );
}
