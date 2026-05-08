"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/**
 * /project/[id]/drafts — Creator HITL UI for marketing-agent drafts.
 *
 * Auth: project owner only (RLS enforces server-side, this is the
 * client-side render path).
 *
 * Realtime: subscribes to project_drafts INSERT so newly-generated
 * drafts animate in as marketing-agent finishes.
 *
 * Publish UX (the "1-click" promise):
 *   - Platforms with text-intent URLs (X, Reddit, Bluesky, Threads, HN):
 *     click → platform compose opens with text pre-filled.
 *   - Platforms without text intent (LinkedIn, Dev.to, Product Hunt,
 *     Xiaohongshu, Jike, Zhihu, Bilibili): click → text auto-copied to
 *     clipboard, then platform compose opens. User pastes once.
 */

interface Draft {
  id: string;
  project_id: string;
  platform: string;
  language: "en" | "zh";
  variant_key: string | null;
  title: string | null;
  body: string;
  subreddit: string | null;
  status: "pending" | "approved" | "posted" | "rejected" | "failed";
  posted_url: string | null;
  posted_at: string | null;
  views: number;
  likes: number;
  comments: number;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

const COVER_SUPPORTED_PLATFORMS = new Set(["xiaohongshu"]);

const PLATFORM_LABEL: Record<string, string> = {
  x: "X (Twitter)",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  hacker_news: "Hacker News",
  dev_to: "Dev.to",
  bluesky: "Bluesky",
  threads: "Threads",
  producthunt: "Product Hunt",
  xiaohongshu: "Xiaohongshu",
  jike: "Jike",
  zhihu: "Zhihu",
  bilibili: "Bilibili",
};

// Platforms where the intent URL pre-fills the compose text. The other
// platforms still get an "Open" button but require a paste step — we
// auto-copy the body to clipboard before opening so it's still ~1 click.
const PLATFORMS_WITH_TEXT_INTENT = new Set([
  "x",
  "reddit",
  "bluesky",
  "threads",
  "hacker_news",
]);

const PLATFORM_INTENT_URL: Record<
  string,
  (text: string, opts: { title?: string | null; url?: string; subreddit?: string | null }) => string
> = {
  x: (text) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 270))}`,
  reddit: (text, { title, subreddit }) => {
    const sub = subreddit && subreddit.trim() ? subreddit.trim() : "SideProject";
    return `https://www.reddit.com/r/${encodeURIComponent(sub)}/submit?title=${encodeURIComponent(title || "")}&text=${encodeURIComponent(text)}`;
  },
  linkedin: () => `https://www.linkedin.com/feed/?shareActive=true`,
  hacker_news: (_, { title, url }) =>
    `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url || "")}&t=${encodeURIComponent(title || "")}`,
  dev_to: () => `https://dev.to/new`,
  bluesky: (text) =>
    `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
  threads: (text) =>
    `https://threads.net/intent/post?text=${encodeURIComponent(text)}`,
  producthunt: () => `https://www.producthunt.com/posts/new`,
  xiaohongshu: () => `https://creator.xiaohongshu.com/publish/publish`,
  jike: () => `https://web.okjike.com/`,
  zhihu: () => `https://www.zhihu.com/answer/new`,
  bilibili: () => `https://t.bilibili.com/`,
};

type StatusFilter = "all" | "pending" | "approved" | "posted" | "rejected";

const FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
  posted: "Posted",
  rejected: "Rejected",
};

export default function DraftsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<{ title: string; tagline: string; demo_url: string | null } | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const searchParams = useSearchParams();
  const justForged = searchParams.get("forged") === "1";
  const [pollAttempt, setPollAttempt] = useState(0);

  const loadDrafts = useCallback(async () => {
    const { data, error } = await supabase
      .from("project_drafts")
      .select("*")
      .eq("project_id", id)
      .order("platform", { ascending: true })
      .order("language", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setDrafts((data || []) as Draft[]);
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("title, tagline, demo_url")
        .eq("id", id)
        .maybeSingle();
      setProject(p as { title: string; tagline: string; demo_url: string | null } | null);
      await loadDrafts();
      setLoading(false);
    })();

    const channel = supabase
      .channel(`drafts-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_drafts",
          filter: `project_id=eq.${id}`,
        },
        () => loadDrafts(),
      )
      .subscribe();

    // Belt-to-realtime suspenders: when ?forged=1 is in the URL the
    // user just submitted and is expecting drafts to arrive within
    // ~10s. Realtime usually catches it, but if subscribe() races
    // the first INSERT we'd miss it. Poll every 4s for the first
    // ~90s as a backup.
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    if (justForged) {
      pollTimer = setInterval(() => {
        setPollAttempt((a) => a + 1);
        loadDrafts();
      }, 4000);
      // Stop polling after 90s — at that point if drafts still aren't
      // here, something's wrong and the manual button is the path.
      setTimeout(() => {
        if (pollTimer) clearInterval(pollTimer);
      }, 90_000);
    }

    return () => {
      channel.unsubscribe();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [id, authLoading, loadDrafts, justForged]);

  const triggerGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/generate-drafts`, {
        method: "POST",
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        alert(
          body.message ||
            "Daily quota exhausted. Resets at UTC 00:00.",
        );
      }
    } finally {
      setTimeout(() => setGenerating(false), 3000);
    }
  };

  const updateDraft = async (draftId: string, patch: Partial<Draft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, ...patch } : d)),
    );
    await supabase.from("project_drafts").update(patch).eq("id", draftId);
  };

  const counts: Record<StatusFilter, number> = {
    all: drafts.length,
    pending: drafts.filter((d) => d.status === "pending").length,
    approved: drafts.filter((d) => d.status === "approved").length,
    posted: drafts.filter((d) => d.status === "posted").length,
    rejected: drafts.filter((d) => d.status === "rejected").length,
  };

  const visible = filter === "all" ? drafts : drafts.filter((d) => d.status === filter);

  const grouped: Record<string, Draft[]> = {};
  for (const d of visible) {
    if (!grouped[d.platform]) grouped[d.platform] = [];
    grouped[d.platform].push(d);
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground/60">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground/60">Sign in required.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/project/${id}`}
          className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 hover:text-violet-300"
        >
          ← Back to project
        </Link>

        <header className="mt-3 mb-6">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-2">
            ▸ MARKETING DRAFTS
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-sans">
            {project?.title}
          </h1>
          <p className="text-foreground/70 text-sm mt-1.5 font-sans leading-relaxed">
            {project?.tagline}
          </p>
          <p className="text-foreground/45 text-xs mt-3 font-sans leading-relaxed">
            Click <span className="text-emerald-300">Open {`{platform}`}</span> —
            text auto-copies and the platform opens. X / Reddit / HN /
            Bluesky / Threads pre-fill the compose form. LinkedIn / Dev.to /
            Xiaohongshu / Jike / Zhihu / Bilibili you paste once.
          </p>
        </header>

        {drafts.length === 0 ? (
          justForged && pollAttempt < 22 ? (
            <section className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent p-10 text-center">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
                <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-300">
                  Drafts generating
                </p>
              </div>
              <p className="text-foreground/80 mb-1 text-base">
                Claude is writing 17 platform-native drafts.
              </p>
              <p className="text-foreground/50 text-sm">
                ~10 seconds · they'll appear below as they finish.
              </p>
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-10 text-center">
              <p className="text-foreground/60 mb-4">
                {justForged
                  ? "Drafts didn't arrive — quota check failed or generation errored. Try the button below."
                  : "No drafts yet. Click below to generate."}
              </p>
              <button
                onClick={triggerGenerate}
                disabled={generating}
                className="px-5 py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate drafts"}
              </button>
            </section>
          )
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {(Object.keys(FILTER_LABEL) as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs rounded font-pixel uppercase tracking-wider transition-colors ${
                      filter === f
                        ? "bg-violet-600 text-white"
                        : "border border-white/10 hover:bg-white/5 text-foreground/70"
                    }`}
                  >
                    {FILTER_LABEL[f]} ({counts[f]})
                  </button>
                ))}
              </div>
              <button
                onClick={triggerGenerate}
                disabled={generating}
                className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Re-generate"}
              </button>
            </div>

            {visible.length === 0 ? (
              <p className="text-foreground/40 italic text-sm py-12 text-center">
                No drafts in {filter}.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([platform, ds]) => (
                  <section
                    key={platform}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                      <h2 className="font-pixel text-[11px] uppercase tracking-wider text-emerald-300">
                        {PLATFORM_LABEL[platform] || platform}
                      </h2>
                      <span className="text-foreground/40 text-xs">
                        ({ds.length} {ds.length === 1 ? "draft" : "drafts"})
                      </span>
                      {!PLATFORMS_WITH_TEXT_INTENT.has(platform) && (
                        <span className="text-[9px] text-foreground/40 italic ml-auto">
                          paste-required platform
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {ds.map((d) => (
                        <DraftCard
                          key={d.id}
                          draft={d}
                          projectUrl={project?.demo_url || `https://www.vibexforge.com/project/${id}`}
                          onUpdate={(patch) => updateDraft(d.id, patch)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function DraftCard({
  draft,
  projectUrl,
  onUpdate,
}: {
  draft: Draft;
  projectUrl: string;
  onUpdate: (patch: Partial<Draft>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(draft.body);
  const [copied, setCopied] = useState(false);
  const [postedUrlInput, setPostedUrlInput] = useState(draft.posted_url || "");
  const [rerolling, setRerolling] = useState(false);

  // Keep local body in sync if the row is updated externally (e.g. cron
  // re-scrape, or a successful reroll that arrives via realtime).
  useEffect(() => {
    if (!editing) setBody(draft.body);
  }, [draft.body, editing]);

  const reroll = async () => {
    if (rerolling) return;
    setRerolling(true);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/reroll`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) {
          alert(err.message || "Daily quota exhausted. Resets at UTC 00:00.");
        } else {
          console.error("[reroll]", err);
        }
      }
      // Realtime subscription on the parent page refreshes draft.body.
    } finally {
      setRerolling(false);
    }
  };

  const [generatingCover, setGeneratingCover] = useState(false);
  const generateCover = async () => {
    if (generatingCover) return;
    setGeneratingCover(true);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/generate-cover`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) {
          alert(err.message || "Cover costs 10 credits — quota exhausted.");
        } else {
          alert(err.message || "Cover generation failed");
        }
      }
      // Realtime subscription refreshes draft.cover_image_url.
    } finally {
      setGeneratingCover(false);
    }
  };
  const supportsCover = COVER_SUPPORTED_PLATFORMS.has(draft.platform);

  const intentBuilder = PLATFORM_INTENT_URL[draft.platform];
  const intentUrl = intentBuilder
    ? intentBuilder(body, {
        title: draft.title,
        url: projectUrl,
        subreddit: draft.subreddit,
      })
    : null;

  const fullText = draft.title ? `${draft.title}\n\n${body}` : body;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch {
      return false;
    }
  };

  const copyAction = async () => {
    const ok = await copyToClipboard();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // The "1-click publish" experience — auto-copy then open platform.
  // For platforms without text-intent URLs the user still has to paste,
  // but at least the text is already on their clipboard.
  const openPlatform = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!intentUrl) return;
    e.preventDefault();
    await copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const save = () => {
    setEditing(false);
    onUpdate({ body });
  };

  const markPosted = () => {
    onUpdate({
      status: "posted",
      posted_at: new Date().toISOString(),
    } as Partial<Draft>);
  };

  const savePostedUrl = () => {
    if (postedUrlInput.trim() === (draft.posted_url || "")) return;
    onUpdate({ posted_url: postedUrlInput.trim() || null });
  };

  const reject = () => onUpdate({ status: "rejected" });
  const reopen = () => onUpdate({ status: "pending" });

  const statusColor =
    draft.status === "posted"
      ? "text-emerald-400"
      : draft.status === "approved"
      ? "text-yellow-400"
      : draft.status === "rejected"
      ? "text-red-400"
      : "text-foreground/50";

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {draft.variant_key && (
          <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono">
            {draft.variant_key}
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-foreground/70 font-mono">
          {draft.language.toUpperCase()}
        </span>
        <span className={`text-xs uppercase tracking-wider ${statusColor}`}>
          {draft.status}
        </span>
        <span className="text-xs text-foreground/40 font-mono">
          {body.length} chars
        </span>
        {draft.status === "posted" && (draft.views > 0 || draft.likes > 0) && (
          <span className="text-xs text-foreground/50">
            {draft.views} views · {draft.likes} likes
            {draft.comments > 0 ? ` · ${draft.comments} comments` : ""}
          </span>
        )}
      </div>

      {draft.title && (
        <p className="font-bold text-foreground mb-2 text-sm">{draft.title}</p>
      )}

      {draft.cover_image_url && (
        <a
          href={draft.cover_image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 w-32 sm:w-40 rounded overflow-hidden border border-pink-500/20 hover:border-pink-500/40 transition-colors"
          title="Click to open full-size cover"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={draft.cover_image_url}
            alt="Cover"
            className="w-full h-auto block"
            loading="lazy"
          />
        </a>
      )}

      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={Math.max(4, Math.ceil(body.length / 80))}
          className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm text-foreground/90 font-mono"
        />
      ) : (
        <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans">
          {body}
        </pre>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {editing ? (
          <button
            onClick={save}
            className="px-3 py-1 text-xs rounded bg-violet-600 hover:bg-violet-500 text-white"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5"
          >
            Edit
          </button>
        )}
        <button
          onClick={copyAction}
          className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <button
          onClick={reroll}
          disabled={rerolling}
          className="px-3 py-1 text-xs rounded border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 disabled:opacity-50"
          title="Regenerate just this draft (~$0.005)"
        >
          {rerolling ? "Rerolling…" : "🎲 Re-roll"}
        </button>
        {supportsCover && (
          <button
            onClick={generateCover}
            disabled={generatingCover}
            className="px-3 py-1 text-xs rounded border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300 disabled:opacity-50"
            title="Generate Xiaohongshu cover image (10 credits, ~$0.05)"
          >
            {generatingCover
              ? "✨ Painting…"
              : draft.cover_image_url
                ? "🎨 Re-cover"
                : "🎨 Cover"}
          </button>
        )}
        {intentUrl && (
          <a
            href={intentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openPlatform}
            className="px-3 py-1 text-xs rounded border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300"
            title={
              PLATFORMS_WITH_TEXT_INTENT.has(draft.platform)
                ? "Opens compose with text pre-filled"
                : "Auto-copies text + opens platform — paste once"
            }
          >
            Open {PLATFORM_LABEL[draft.platform] || draft.platform} →
          </a>
        )}
        {draft.status !== "posted" ? (
          <button
            onClick={markPosted}
            className="px-3 py-1 text-xs rounded border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-300"
          >
            Mark posted
          </button>
        ) : (
          <button
            onClick={reopen}
            className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5 text-foreground/60"
          >
            Reopen
          </button>
        )}
        {draft.status !== "rejected" && (
          <button
            onClick={reject}
            className="px-3 py-1 text-xs rounded border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400"
          >
            Reject
          </button>
        )}
      </div>

      {draft.status === "posted" && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <input
            type="url"
            placeholder="Paste the published URL (used to track engagement later)"
            value={postedUrlInput}
            onChange={(e) => setPostedUrlInput(e.target.value)}
            onBlur={savePostedUrl}
            className="flex-1 min-w-[240px] bg-black/30 border border-white/10 rounded px-3 py-1.5 text-xs text-foreground/90 font-mono placeholder:text-foreground/30"
          />
          {draft.posted_url && draft.posted_url === postedUrlInput && (
            <a
              href={draft.posted_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:underline"
            >
              View ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
