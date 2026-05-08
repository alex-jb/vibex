"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
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
  created_at: string;
  updated_at: string;
}

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
    return () => {
      channel.unsubscribe();
    };
  }, [id, authLoading, loadDrafts]);

  const triggerGenerate = async () => {
    setGenerating(true);
    try {
      await fetch(`/api/projects/${id}/generate-drafts`, { method: "POST" });
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
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-1">
            ▸ MARKETING DRAFTS · MULTI-CHANNEL DISTRIBUTION
          </p>
          <h1 className="text-2xl font-bold text-foreground">{project?.title}</h1>
          <p className="text-foreground/60 text-sm mt-1">{project?.tagline}</p>
          <p className="text-foreground/40 text-xs mt-2">
            Click <span className="text-emerald-400">Open {`{platform}`}</span> →
            text auto-copies and the platform opens. For X / Reddit / HN /
            Bluesky / Threads the compose form is pre-filled. For LinkedIn /
            Dev.to / Xiaohongshu / Jike / Zhihu / Bilibili you paste once.
          </p>
        </header>

        {drafts.length === 0 ? (
          <section className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-10 text-center">
            <p className="text-foreground/60 mb-4">
              No drafts yet. Click below to generate.
            </p>
            <button
              onClick={triggerGenerate}
              disabled={generating}
              className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-pixel text-[10px] uppercase tracking-wider disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate drafts"}
            </button>
          </section>
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
