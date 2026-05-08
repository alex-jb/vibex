/**
 * scripts/dogfood-vibex-launch.ts
 *
 * Dogfood: generate VibeXForge's own multi-platform launch drafts using
 * the production marketing-agent path (lib/draft-generator.ts) — same
 * code that runs when a creator hits POST /api/projects/[id]/generate-drafts
 * in prod. Writes outputs to out/dogfood-vibex-launch/ for inspection.
 *
 * Why this exists: 2026-05-08. Tom Huang shared nexu-io/open-design on
 * 小红书 — 31.5K stars in a few weeks for an open-source design tool.
 * The interesting question for VibeX isn't whether to fork open-design
 * (it's not in our lane), but whether our marketing-agent can write a
 * launch set that compares favorably against the kind of posts that
 * actually drive 30K stars. This script lets Alex eyeball that gap.
 *
 * Usage:
 *   npx --yes tsx scripts/dogfood-vibex-launch.ts
 */

import { config as loadEnv } from "dotenv";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { generateDraftsInMemory, type ProjectInput } from "../lib/draft-generator";

loadEnv({ path: ".env.local" });

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out", "dogfood-vibex-launch");

const project: ProjectInput = {
  id: "vibex-self-dogfood",
  title: "VibeXForge",
  tagline:
    "Submit your AI app once. Our agents auto-write 10+ platform-native posts in 5 seconds — X, Xiaohongshu, Reddit, HN, Dev.to, LinkedIn, and 6 more.",
  description: [
    "VibeXForge is a distribution amplifier built for solo and indie AI",
    "creators. Solo founders ship great AI apps and then stall on",
    "distribution — writing 10 platform-specific posts is a half-day",
    "of work no one wants to do. We do it for them.",
    "",
    "How it works:",
    "1. Submit your AI project URL or GitHub repo (30s).",
    "2. Claude Sonnet 4.6 writes platform-specific drafts in parallel",
    "   (~10s for 17 drafts across 10 platforms × applicable languages).",
    "3. Review, edit inline, one-click publish to each platform.",
    "",
    "Bilingual EN ↔ ZH built-in — Western indie hackers AND Chinese AI",
    "creators on 小红书 / 即刻 / 知乎 / B站 reach with the same submit.",
    "",
    "Built solo by Alex (@alex-jb). MIT-licensed. 990+ tests, 0 open",
    "issues, 4 production CI workflows. Free during beta — first 100",
    "creators get unlimited generation + priority on the discovery feed.",
  ].join("\n"),
  category: "AI Tools",
  tags: ["AI", "marketing", "distribution", "indie", "open-source", "bilingual"],
  demoUrl: "https://vibexforge.com",
  recentChanges: [
    "Landing page rewritten in IH style (2026-05-08)",
    "Creator dashboard at /dashboard with realtime draft pipeline",
    "Drafts-ready email retention loop wired into submit flow",
    "EN/中文 toggle now actually toggles — was rendering both before",
  ],
};

async function main() {
  await mkdir(outDir, { recursive: true });
  console.log(`Generating drafts for ${project.title}...`);
  const start = Date.now();

  const { rows, failed } = await generateDraftsInMemory(project, {});

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Got ${rows.length} drafts (${failed} failed) in ${elapsed}s\n`);

  const indexLines: string[] = [
    `# VibeXForge dogfood draft set — generated ${new Date().toISOString()}`,
    ``,
    `Total: ${rows.length} drafts (${failed} failed) in ${elapsed}s`,
    ``,
    `| # | Platform | Lang | Variant | Length | File |`,
    `|---|----------|------|---------|--------|------|`,
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const slug = `${String(i + 1).padStart(2, "0")}-${r.platform}-${r.language}${
      r.variant_key ? "-" + r.variant_key : ""
    }`;
    const fname = `${slug}.md`;
    const fpath = join(outDir, fname);
    const md = [
      `# ${r.platform} · ${r.language}${r.variant_key ? " · " + r.variant_key : ""}`,
      ``,
      r.title ? `**Title:** ${r.title}` : "",
      `**Length:** ${r.body.length} chars`,
      ``,
      `---`,
      ``,
      r.body,
      ``,
    ]
      .filter(Boolean)
      .join("\n");
    await writeFile(fpath, md);
    indexLines.push(
      `| ${i + 1} | ${r.platform} | ${r.language} | ${r.variant_key || "-"} | ${r.body.length} | [${fname}](${fname}) |`,
    );
  }

  await writeFile(join(outDir, "INDEX.md"), indexLines.join("\n") + "\n");

  console.log(`Wrote ${rows.length} drafts to out/dogfood-vibex-launch/`);
  console.log(`Open out/dogfood-vibex-launch/INDEX.md to review.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
