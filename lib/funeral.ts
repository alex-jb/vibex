/**
 * lib/funeral.ts — AI Side Project Funeral eulogy generator.
 *
 * Spec: alex-brain research/2026-05-31-vibecoding-viral-tracks.md (track #1)
 *
 * Pipeline:
 *   1. Parse github.com/{owner}/{repo} URL
 *   2. Fetch repo metadata (stars, forks, last commit, language, age)
 *   3. Claude Sonnet writes ~250-word eulogy in priest voice
 *   4. (Optional) gpt-image-1 generates "burning logo" image
 *   5. Persist to funerals table, return id for sharing
 *
 * Cost per funeral: ~$0.015 ($0.012 Sonnet + $0.003 image when requested).
 */
import Anthropic from "@anthropic-ai/sdk";

export interface RepoMeta {
  owner: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  open_issues: number;
}

export interface RepoTooAlive {
  ok: false;
  reason: "still_alive";
  message: string;
  last_pushed_days_ago: number;
}

export interface RepoFetchError {
  ok: false;
  reason: "not_found" | "rate_limited" | "network";
  message: string;
}

export interface RepoOk {
  ok: true;
  meta: RepoMeta;
  days_since_last_push: number;
  age_days_alive: number;
}

const DEAD_THRESHOLD_DAYS = 180;

const GH_URL_RE = /github\.com\/([\w.-]+)\/([\w.-]+)/i;

export function parseGithubUrl(
  url: string,
): { owner: string; name: string } | null {
  const m = url.match(GH_URL_RE);
  if (!m) return null;
  const owner = m[1].replace(/\.git$/, "");
  const name = m[2].replace(/\.git$/, "");
  if (!owner || !name) return null;
  return { owner, name };
}

export async function fetchRepoMeta(
  url: string,
): Promise<RepoOk | RepoTooAlive | RepoFetchError> {
  const parsed = parseGithubUrl(url);
  if (!parsed) {
    return {
      ok: false,
      reason: "not_found",
      message: "Not a github.com URL",
    };
  }
  const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.name}`;
  let resp: Response;
  try {
    resp = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "vibexforge-funeral/1.0",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
  } catch (err) {
    return {
      ok: false,
      reason: "network",
      message: `Network error: ${err}`,
    };
  }
  if (resp.status === 404) {
    return {
      ok: false,
      reason: "not_found",
      message: "Repo not found (or private). The body of the deceased is missing.",
    };
  }
  if (resp.status === 403 || resp.status === 429) {
    return {
      ok: false,
      reason: "rate_limited",
      message:
        "GitHub rate limit hit. Please come back in an hour to bury this project.",
    };
  }
  if (!resp.ok) {
    return {
      ok: false,
      reason: "network",
      message: `GitHub API ${resp.status}`,
    };
  }
  const data = (await resp.json()) as RepoMeta & {
    pushed_at: string;
    created_at: string;
  };

  const pushedDate = new Date(data.pushed_at);
  const now = new Date();
  const daysSincePush =
    Math.floor((now.getTime() - pushedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSincePush < DEAD_THRESHOLD_DAYS && !data.archived) {
    return {
      ok: false,
      reason: "still_alive",
      message: `This project still has a heartbeat (last commit ${daysSincePush} days ago). Funerals require at least ${DEAD_THRESHOLD_DAYS} days of inactivity OR an archived flag.`,
      last_pushed_days_ago: daysSincePush,
    };
  }

  const createdDate = new Date(data.created_at);
  const ageDaysAlive =
    Math.floor((pushedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    ok: true,
    meta: data,
    days_since_last_push: daysSincePush,
    age_days_alive: ageDaysAlive,
  };
}

export interface EulogyInput {
  meta: RepoMeta;
  days_since_last_push: number;
  age_days_alive: number;
  mourner_name?: string;
}

const PRIEST_SYSTEM = `You are a priest writing the funeral eulogy for a deceased open-source side project. The deceased lived a short life on GitHub before being abandoned.

Voice rules:
- Address the gathered "mourners" (the project's stargazers and forkers) in the opening.
- Reference the project's life events: birth (created_at), brief flame of activity, the dwindling commits, the silent months, the last commit it ever pushed.
- Use the project name like it was a person's name.
- Be warm and slightly bittersweet. Some humor about side-project culture is fine.
- 200-250 words. No more. No less.
- End with a single line of benediction.
- Output only the eulogy text. No headers, no markdown, no quotation marks.`;

export async function writeEulogy(input: EulogyInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return defaultEulogy(input);
  }
  const client = new Anthropic({ apiKey });
  const userMsg = renderEulogyPrompt(input);

  try {
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: PRIEST_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    });
    const text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .trim();
    return text || defaultEulogy(input);
  } catch (err) {
    console.error("[funeral] Claude eulogy failed:", err);
    return defaultEulogy(input);
  }
}

function renderEulogyPrompt(input: EulogyInput): string {
  const m = input.meta;
  return `Project name: ${m.name}
GitHub URL: ${m.url || `https://github.com/${m.owner}/${m.name}`}
Owner: ${m.owner}
Description: ${m.description || "(no description was ever written)"}
Born (first commit): ${m.created_at?.slice(0, 10)}
Last commit (date of death): ${m.pushed_at?.slice(0, 10)}
Days alive: ${input.age_days_alive}
Days silent since death: ${input.days_since_last_push}
Primary language: ${m.language || "unknown"}
Stars at time of death: ${m.stars}
Forks at time of death: ${m.forks}
Open issues left unanswered: ${m.open_issues}
Archived officially: ${m.archived ? "yes" : "no"}
Mourner present today: ${input.mourner_name || "an anonymous developer"}

Write the eulogy.`;
}

function defaultEulogy(input: EulogyInput): string {
  // Fallback used when ANTHROPIC_API_KEY is missing OR Claude failed.
  const m = input.meta;
  return `Mourners — we gather to remember ${m.name}, born ${m.created_at?.slice(0, 10)}, who pushed its last commit ${input.days_since_last_push} days ago. It lived ${input.age_days_alive} days, gathered ${m.stars} stargazers, and left ${m.open_issues} issues unanswered when silence took it. May its forks find peace. Amen.`;
}

/**
 * Generate the "ash spreading" image — the project's logo dissolving into
 * smoke. Uses gpt-image-1 (OpenAI). Returns the data URL or null if skipped.
 *
 * Cost: ~$0.003 per image at standard quality.
 */
export async function generateAshImage(
  repoName: string,
  language: string | null,
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `A solemn pixel-art memorial: the project name "${repoName}" written in ash-grey serif font centered on a black background, with embers and gentle smoke trailing upward. ${language ? `${language} mascot fading in the corner.` : ""} Funeral aesthetic. Candle glow at bottom. 1024x1024.`,
        n: 1,
        size: "1024x1024",
        quality: "low",
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      data: { url?: string; b64_json?: string }[];
    };
    const first = data.data?.[0];
    if (first?.url) return first.url;
    if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
    return null;
  } catch {
    return null;
  }
}
