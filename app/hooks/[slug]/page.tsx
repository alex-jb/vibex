import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HOOK_ARCHETYPES } from "@/lib/hook-archetypes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return HOOK_ARCHETYPES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = HOOK_ARCHETYPES.find((x) => x.slug === slug);
  if (!a) return { title: "Archetype not found · VibeXForge" };
  return {
    title: `${a.display_en} · ${a.display_zh} · Hook Archetype #${
      HOOK_ARCHETYPES.findIndex((x) => x.slug === slug) + 1
    } · VibeXForge`,
    description: `${a.description_en} Common in: ${a.common_in}. Free hook breakdown at vibexforge.com/tools/video-decode.`,
    openGraph: {
      title: `${a.display_en} · ${a.display_zh}`,
      description: a.description_en,
      type: "article",
    },
  };
}

export default async function ArchetypePage({ params }: PageProps) {
  const { slug } = await params;
  const a = HOOK_ARCHETYPES.find((x) => x.slug === slug);
  if (!a) notFound();

  const idx = HOOK_ARCHETYPES.findIndex((x) => x.slug === slug);
  const prev = HOOK_ARCHETYPES[(idx - 1 + HOOK_ARCHETYPES.length) % HOOK_ARCHETYPES.length];
  const next = HOOK_ARCHETYPES[(idx + 1) % HOOK_ARCHETYPES.length];

  return (
    <main className="min-h-screen px-6 py-12 text-zinc-100" style={{ background: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/hooks"
          className="text-xs text-zinc-500 hover:text-[var(--accent-indigo)]"
        >
          ← back to all archetypes
        </Link>

        <header className="mt-6">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="font-mono">#{String(idx + 1).padStart(2, "0")} of 12</span>
            <span>·</span>
            <span className="text-[var(--accent-indigo)] font-medium">{a.common_in}</span>
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">{a.display_en}</h1>
          <p className="mt-2 text-2xl text-zinc-400">{a.display_zh}</p>
        </header>

        <section className="mt-10 rounded-[var(--r-card)] border border-[var(--accent-indigo)] bg-[var(--bg-elev)] p-6">
          <div className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] mb-3">
            Pattern
          </div>
          <p className="text-lg text-zinc-100 leading-relaxed">{a.description_en}</p>
          <p className="mt-3 text-base text-zinc-300 leading-relaxed">{a.description_zh}</p>
        </section>

        <section className="mt-8 rounded-[var(--r-card)] border border-[var(--border-soft)] bg-[var(--bg-elev)] p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Common in · 常见类目
          </div>
          <p className="text-base text-zinc-200">{a.common_in}</p>
        </section>

        <section className="mt-8 rounded-[var(--r-card)] border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="text-xs uppercase tracking-widest text-amber-400 mb-3">
            ✨ Decode your own video
          </div>
          <p className="text-zinc-200 leading-relaxed">
            Paste a Douyin link → AI watches → tells you if it matches{" "}
            <span className="text-amber-400 font-medium">{a.display_en}</span> or one of the
            other 11 archetypes, plus the virality score and 3 remix scripts you can adapt.
          </p>
          <Link
            href="/tools/video-decode"
            className="mt-4 inline-block rounded-[var(--r-card)] bg-[var(--accent-indigo)] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            🎬 Decode a video — free 3/day →
          </Link>
        </section>

        <nav className="mt-12 flex items-center justify-between border-t border-[var(--border-soft)] pt-6">
          <Link
            href={`/hooks/${prev.slug}`}
            className="group flex flex-col text-left"
          >
            <span className="text-xs text-zinc-500">← previous</span>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-[var(--accent-indigo)]">
              {prev.display_en}
            </span>
            <span className="text-xs text-zinc-500">{prev.display_zh}</span>
          </Link>
          <Link
            href={`/hooks/${next.slug}`}
            className="group flex flex-col text-right"
          >
            <span className="text-xs text-zinc-500">next →</span>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-[var(--accent-indigo)]">
              {next.display_en}
            </span>
            <span className="text-xs text-zinc-500">{next.display_zh}</span>
          </Link>
        </nav>

        <footer className="mt-12 text-center text-xs text-zinc-500">
          <p>
            From{" "}
            <a
              href="https://github.com/alex-jb/vibex-video-decoder-skill/blob/main/hook-archetypes.csv"
              className="text-[var(--accent-indigo)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              hook-archetypes.csv
            </a>{" "}
            · MIT · contributions welcome
          </p>
        </footer>
      </div>
    </main>
  );
}
