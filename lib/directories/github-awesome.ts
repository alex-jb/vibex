/**
 * GitHub awesome-list PR adapter.
 *
 * For v0.1 we only target `punkpeye/awesome-mcp-servers` because the
 * fast-track from 2026-05-09's submission packet already proved
 * acceptance there (PR #6229). Extending to other awesome-lists in v0.2
 * just means more entries in REPO_CONFIGS.
 *
 * Flow: fork → branch → edit README.md → PR → return PR URL.
 *
 * ToS: submitting PRs to public open-source repos via the public API
 * is the canonical octokit use case. Maintainers can reject if quality
 * is low — which is why each entry is hand-formatted from the project's
 * own metadata (no LLM hallucination).
 *
 * Env: GITHUB_TOKEN (public_repo scope minimum).
 */
import type {
  DirectoryAdapter,
  DirectoryAdapterProjectInput,
  SubmissionResult,
} from "@/lib/directory-submitter";

type RepoConfig = {
  owner: string;
  repo: string;
  /** Default branch on the upstream repo (almost always 'main'). */
  baseBranch: string;
  /** File in the repo we append to. */
  readmePath: string;
  /** Regex matching the section header we append below. */
  sectionAnchor: RegExp;
  /** Renders one entry line in the repo's existing format. */
  formatEntry: (p: DirectoryAdapterProjectInput) => string;
  /** Predicate: should we submit this project to this awesome-list at all? */
  filter: (p: DirectoryAdapterProjectInput) => boolean;
};

const REPO_CONFIGS: RepoConfig[] = [
  {
    owner: "punkpeye",
    repo: "awesome-mcp-servers",
    baseBranch: "main",
    readmePath: "README.md",
    sectionAnchor: /## Community Servers\b/,
    filter: (p) => {
      const haystack = [p.title, p.tagline, p.description, ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase();
      // Only submit MCP-shaped projects to this list. Wider definition than just
      // exact "mcp" string — "model context protocol" counts too.
      return /\b(mcp|model context protocol)\b/.test(haystack);
    },
    formatEntry: (p) => {
      const url = p.demoUrl ?? `https://vibexforge.com/project/${p.id}`;
      return `- [${p.title}](${url}) - ${p.tagline}`;
    },
  },
];

function isAvailable(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

async function submit(
  p: DirectoryAdapterProjectInput,
): Promise<SubmissionResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { status: "failed", errorMessage: "GITHUB_TOKEN not set" };
  }

  // Find the first matching repo this project qualifies for. v0.1 = one repo,
  // so for non-MCP projects this adapter simply skips with a clear message.
  const target = REPO_CONFIGS.find((c) => c.filter(p));
  if (!target) {
    return {
      status: "rejected",
      errorMessage: "no awesome-list in REPO_CONFIGS matches this project's tags/description",
    };
  }

  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: token, userAgent: "vibexforge-directory-submitter" });

  // 1) Read current README
  let readmeContent: string;
  let readmeSha: string;
  try {
    const { data } = await octokit.repos.getContent({
      owner: target.owner,
      repo: target.repo,
      path: target.readmePath,
      ref: target.baseBranch,
    });
    if (Array.isArray(data) || data.type !== "file") {
      return { status: "failed", errorMessage: `README at ${target.readmePath} is not a file` };
    }
    readmeContent = Buffer.from(data.content, "base64").toString("utf8");
    readmeSha = data.sha;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "failed", errorMessage: `getContent: ${msg}` };
  }

  // 2) Verify project not already listed (idempotency)
  const projectUrl = p.demoUrl ?? `https://vibexforge.com/project/${p.id}`;
  if (readmeContent.includes(projectUrl)) {
    return {
      status: "approved",
      externalUrl: `https://github.com/${target.owner}/${target.repo}`,
      errorMessage: "already listed in upstream README",
    };
  }

  // 3) Insert the new entry right after the section anchor
  const anchorMatch = target.sectionAnchor.exec(readmeContent);
  if (!anchorMatch) {
    return { status: "failed", errorMessage: `section anchor not found in README` };
  }
  const insertAt = readmeContent.indexOf("\n", anchorMatch.index + anchorMatch[0].length) + 1;
  const entry = target.formatEntry(p) + "\n";
  const newContent = readmeContent.slice(0, insertAt) + entry + readmeContent.slice(insertAt);

  // 4) Fork (idempotent — already-forked returns the existing fork)
  let forkLogin: string;
  try {
    const { data: fork } = await octokit.repos.createFork({
      owner: target.owner,
      repo: target.repo,
    });
    forkLogin = fork.owner.login;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "failed", errorMessage: `fork: ${msg}` };
  }

  // 5) Sync fork main → upstream main so our branch is up-to-date before edit
  try {
    await octokit.repos.mergeUpstream({
      owner: forkLogin,
      repo: target.repo,
      branch: target.baseBranch,
    });
  } catch {
    // Non-fatal — if mergeUpstream fails, our branch may just be slightly behind.
  }

  // 6) Create a branch + commit on the fork
  const branchName = `add-${p.id}-${Date.now().toString(36)}`;
  try {
    const { data: baseRef } = await octokit.git.getRef({
      owner: forkLogin,
      repo: target.repo,
      ref: `heads/${target.baseBranch}`,
    });
    await octokit.git.createRef({
      owner: forkLogin,
      repo: target.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });
    await octokit.repos.createOrUpdateFileContents({
      owner: forkLogin,
      repo: target.repo,
      path: target.readmePath,
      message: `Add ${p.title} via VibeXForge`,
      content: Buffer.from(newContent, "utf8").toString("base64"),
      sha: readmeSha,
      branch: branchName,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "failed", errorMessage: `commit: ${msg}` };
  }

  // 7) Open PR upstream
  try {
    const { data: pr } = await octokit.pulls.create({
      owner: target.owner,
      repo: target.repo,
      title: `Add ${p.title}`,
      head: `${forkLogin}:${branchName}`,
      base: target.baseBranch,
      body: [
        `Adds **${p.title}** to the list.`,
        ``,
        `> ${p.tagline}`,
        ``,
        `${p.description.slice(0, 500)}${p.description.length > 500 ? "…" : ""}`,
        ``,
        `Project page: https://vibexforge.com/project/${p.id}`,
        ``,
        `Submitted via [VibeXForge](https://vibexforge.com) — the distribution amplifier for solo AI creators.`,
      ].join("\n"),
      maintainer_can_modify: true,
    });
    return {
      status: "submitted",
      externalId: String(pr.number),
      externalUrl: pr.html_url,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "failed", errorMessage: `pulls.create: ${msg}` };
  }
}

export const githubAwesomeAdapter: DirectoryAdapter = {
  key: "github-awesome-mcp",
  label: "GitHub: awesome-mcp-servers",
  isAvailable,
  submit,
};
