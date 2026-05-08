"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/**
 * /project/[id]/drafts — Creator HITL UI for marketing-agent drafts.
 *
 * Shows drafts grouped by platform, inline edit, status (pending →
 * approved/posted/rejected). For platforms with API auto-post we'll
 * add a 1-click button later. For now: edit + copy + open-platform
 * helpers.
 *
 * Auth: project owner only (RLS enforces server-side, this is the
 * client-side render path).
 *
 * Realtime: subscribes to project_drafts INSERT so newly-generated
 * drafts animate in as marketing-agent finishes.
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
  views: number;
  likes: number;
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
  xiaohongshu: "小红书",
  jike: "即刻",
  zhihu: "知乎",
  bilibili: "B站",
};

const PLATFORM_INTENT_URL: Record<string, (text: string, title?: string | null, url?: string) => string> = {
  x: (text) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 270))}`,
  reddit: (text, title) =>
    `https://www.reddit.com/r/SideProject/submit?title=${encodeURIComponent(title || "")}&text=${encodeURIComponent(text)}`,
  linkedin: () => `https://www.linkedin.com/feed/?shareActive=true`,
  hacker_news: (_, title, url) =>
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

export default function DraftsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<{ title: string; tagline: string; demo_url: string | null } | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

    // Realtime: new drafts arriving as marketing-agent finishes.
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

  const grouped: Record<string, Draft[]> = {};
  for (const d of drafts) {
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

        <header className="mt-3 mb-8">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-1">
            ▸ MARKETING DRAFTS · MULTI-CHANNEL DISTRIBUTION
          </p>
          <h1 className="text-2xl font-bold text-foreground">{project?.title}</h1>
          <p className="text-foreground/60 text-sm mt-1">{project?.tagline}</p>
          <p className="text-foreground/40 text-xs mt-2">
            Drafts generated by VibeX marketing-agent. Edit inline, then copy
            / open the target platform to post manually. Auto-post for
            X / Reddit / Bluesky coming next.
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-foreground/60 text-sm">
                {drafts.length} drafts across {Object.keys(grouped).length}{" "}
                platforms
              </p>
              <button
                onClick={triggerGenerate}
                disabled={generating}
                className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Re-generate"}
              </button>
            </div>

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

  const intentBuilder = PLATFORM_INTENT_URL[draft.platform];
  const intentUrl = intentBuilder
    ? intentBuilder(body, draft.title, projectUrl)
    : null;

  const copy = async () => {
    const full = draft.title ? `${draft.title}\n\n${body}` : body;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => {
    setEditing(false);
    onUpdate({ body });
  };

  const markPosted = () => {
    onUpdate({ status: "posted", posted_at: new Date().toISOString() } as Partial<Draft>);
  };

  const reject = () => onUpdate({ status: "rejected" });

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
        {draft.status === "posted" && draft.views > 0 && (
          <span className="text-xs text-foreground/50">
            {draft.views} views · {draft.likes} likes
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
          onClick={copy}
          className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/5"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        {intentUrl && (
          <a
            href={intentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs rounded border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300"
          >
            Open {PLATFORM_LABEL[draft.platform] || draft.platform} →
          </a>
        )}
        {draft.status !== "posted" && (
          <button
            onClick={markPosted}
            className="px-3 py-1 text-xs rounded border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-300"
          >
            Mark posted
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
    </div>
  );
}
