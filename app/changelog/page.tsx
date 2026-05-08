import Link from "next/link";
import { getChangelog, groupByDate } from "@/lib/changelog";

export const metadata = {
  title: "Changelog — VibeXForge",
  description:
    "What we shipped, when, and why — straight from the master branch's commit history.",
};

// Re-render once an hour so the changelog stays fresh without rebuilding.
export const revalidate = 3600;

const TYPE_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  feat: { label: "feat", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  fix: { label: "fix", className: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  docs: { label: "docs", className: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  refactor: { label: "refactor", className: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  perf: { label: "perf", className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
};

export default function ChangelogPage() {
  const entries = getChangelog(80);
  const groups = groupByDate(entries);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p
          className="font-pixel text-[10px] uppercase tracking-[0.28em] mb-4"
          style={{ color: "#FF4500" }}
        >
          ▸ CHANGELOG · STRAIGHT FROM MASTER
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
          What we shipped.
        </h1>
        <p className="text-foreground/60 text-base mb-12 leading-relaxed">
          Every meaningful commit on master, parsed from the git log. No
          marketing rewrites — what you see is what we wrote when we
          shipped it. {entries.length} entries.
        </p>

        {groups.length === 0 ? (
          <p className="text-foreground/40 italic">
            No conventional commits found in master. Either the build
            doesn&apos;t have git access or master is empty.
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.date}>
                <h2 className="font-pixel text-[11px] uppercase tracking-wider text-foreground/50 mb-3">
                  ▸ {formatDate(g.date)}
                </h2>
                <ul className="space-y-3">
                  {g.entries.map((e) => {
                    const badge = TYPE_BADGE[e.type] || TYPE_BADGE.feat;
                    return (
                      <li
                        key={e.hash}
                        className="rounded-md border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start gap-3 flex-wrap">
                          <span
                            className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          {e.scope && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-white/5 text-foreground/60 font-mono">
                              {e.scope}
                            </span>
                          )}
                          <p className="text-sm text-foreground/90 flex-1 min-w-0 leading-snug">
                            {e.subject}
                          </p>
                          <a
                            href={`https://github.com/alex-jb/vibex/commit/${e.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[11px] text-foreground/40 hover:text-foreground/70 font-mono"
                          >
                            {e.shortHash} ↗
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-foreground/40">
          <p>
            Source:{" "}
            <a
              href="https://github.com/alex-jb/vibex/commits/master"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:underline"
            >
              github.com/alex-jb/vibex/commits/master
            </a>
            {" · "}refreshes hourly.
          </p>
          <p className="mt-2">
            <Link href="/" className="hover:text-foreground/70">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function formatDate(yyyymmdd: string): string {
  const d = new Date(yyyymmdd + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return yyyymmdd;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
