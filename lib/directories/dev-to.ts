/**
 * dev.to directory adapter.
 *
 * Posts a markdown article via the public Articles API. ToS-clean: dev.to
 * explicitly supports API-driven publishing (we're not gaming Reads —
 * we're cross-posting the same content the creator would post manually,
 * tagged for transparency).
 *
 * Env: DEVTO_API_KEY (per-creator scoping comes later; for v0.1 we use
 * the platform's own dev.to account so creators don't need to set one up).
 *
 * Article body is generated from the project's title + tagline +
 * description, includes the demo URL + back-link to vibexforge.com.
 */
import type {
  DirectoryAdapter,
  DirectoryAdapterProjectInput,
  SubmissionResult,
} from "@/lib/directory-submitter";

const API = "https://dev.to/api/articles";

function isAvailable(): boolean {
  return !!process.env.DEVTO_API_KEY;
}

function buildBody(p: DirectoryAdapterProjectInput): string {
  const lines: string[] = [];
  lines.push(`> ${p.tagline}`);
  lines.push("");
  lines.push(p.description);
  lines.push("");
  if (p.thumbnail) {
    lines.push(`![${p.title} cover](${p.thumbnail})`);
    lines.push("");
  }
  if (p.demoUrl) {
    lines.push(`**Try it:** ${p.demoUrl}`);
    lines.push("");
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    `*This project was amplified through [VibeXForge](https://vibexforge.com/project/${p.id}?ref=devto) — the distribution amplifier for solo AI creators. vibe coding ran the first mile; we ran the last.*`,
  );
  return lines.join("\n");
}

function buildTags(p: DirectoryAdapterProjectInput): string[] {
  const t = new Set<string>(["ai", "indiehacker"]);
  for (const tag of p.tags ?? []) {
    const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleaned && cleaned.length <= 25) t.add(cleaned);
  }
  // dev.to caps at 4 tags
  return Array.from(t).slice(0, 4);
}

async function submit(
  p: DirectoryAdapterProjectInput,
): Promise<SubmissionResult> {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    return { status: "failed", errorMessage: "DEVTO_API_KEY not set" };
  }

  const body = {
    article: {
      title: `${p.title} — ${p.tagline}`.slice(0, 128),
      published: true,
      body_markdown: buildBody(p),
      tags: buildTags(p),
      canonical_url: `https://vibexforge.com/project/${p.id}`,
    },
  };

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/vnd.forem.api-v1+json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      status: "failed",
      errorMessage: `dev.to ${res.status}: ${text.slice(0, 200)}`,
    };
  }

  // dev.to returns the created Article. Capture id + url so the dashboard
  // can deep-link.
  let parsed: { id?: number; url?: string } = {};
  try {
    parsed = JSON.parse(text) as { id?: number; url?: string };
  } catch {
    // non-JSON success body is unexpected but not fatal
  }
  return {
    status: "submitted",
    externalId: parsed.id ? String(parsed.id) : undefined,
    externalUrl: parsed.url,
  };
}

export const devToAdapter: DirectoryAdapter = {
  key: "dev-to",
  label: "Dev.to",
  isAvailable,
  submit,
};
