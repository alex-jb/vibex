"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Submission = {
  directory_key: string;
  status: "queued" | "submitted" | "approved" | "rejected" | "failed";
  external_url: string | null;
  error_message: string | null;
  updated_at: string;
};

const DIR_LABELS: Record<string, string> = {
  "dev-to": "Dev.to",
  "github-awesome-mcp": "GitHub: awesome-mcp-servers",
};

const STATUS_TINT: Record<Submission["status"], string> = {
  queued: "text-yellow-300/70",
  submitted: "text-emerald-300",
  approved: "text-emerald-400",
  rejected: "text-foreground/40",
  failed: "text-red-400",
};

const STATUS_LABEL: Record<Submission["status"], string> = {
  queued: "queued",
  submitted: "submitted",
  approved: "live",
  rejected: "n/a",
  failed: "failed",
};

export function DirectorySubmitButton({ projectId }: { projectId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("directory_submissions")
        .select("directory_key, status, external_url, error_message, updated_at")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false });
      if (alive && data) setSubmissions(data as Submission[]);
    })();
    const channel = supabase
      .channel(`directory-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "directory_submissions",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const next = payload.new as Submission | null;
          if (!next) return;
          setSubmissions((prev) => {
            const others = prev.filter((s) => s.directory_key !== next.directory_key);
            return [next, ...others];
          });
        },
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const onSubmit = async () => {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/queue-directory-submissions`,
        { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
      );
      const json = (await res.json()) as {
        inserted?: number;
        alreadyQueued?: number;
        error?: string;
      };
      if (!res.ok) {
        setMsg(json.error ?? `submit failed (${res.status})`);
      } else {
        const i = json.inserted ?? 0;
        const a = json.alreadyQueued ?? 0;
        setMsg(`✓ ${i} queued${a ? ` · ${a} already in queue` : ""}`);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-6 mb-8 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-[10px] uppercase tracking-wider text-amber-300/80">
            ▸ DIRECTORY SUBMISSIONS — last mile
          </p>
          <p className="text-foreground/70 text-sm mt-1 font-sans">
            Auto-submit this project to Tier-1 directories for backlinks.
            <span className="text-foreground/40">
              {" "}
              vibe coding ran the first mile; we run the last.
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-amber-500 text-black font-pixel text-[11px] uppercase tracking-wider disabled:opacity-50 hover:bg-amber-400"
        >
          {submitting ? "queuing…" : "▸ submit to directories"}
        </button>
      </div>
      {msg && (
        <p className="mt-2 text-xs text-amber-200/80 font-sans">{msg}</p>
      )}
      {submissions.length > 0 && (
        <ul className="mt-4 space-y-1">
          {submissions.map((s) => (
            <li
              key={s.directory_key}
              className="flex items-center justify-between text-xs font-sans"
            >
              <span className="text-foreground/80">
                {DIR_LABELS[s.directory_key] ?? s.directory_key}
              </span>
              <span className={`font-pixel text-[10px] uppercase ${STATUS_TINT[s.status]}`}>
                {s.external_url ? (
                  <a
                    href={s.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {STATUS_LABEL[s.status]} ↗
                  </a>
                ) : (
                  STATUS_LABEL[s.status]
                )}
                {s.status === "failed" && s.error_message && (
                  <span className="ml-2 text-foreground/40 normal-case tracking-normal">
                    ({s.error_message.slice(0, 60)})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
