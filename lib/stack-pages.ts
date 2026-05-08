/**
 * lib/stack-pages.ts — config for the 5 vibe-code stack landing pages
 * (/lovable, /v0, /replit, /bolt, /cursor).
 *
 * Each page is a thin server route that imports a shared client
 * component and passes one of these configs. Per-stack hero copy +
 * pain-point framing + sample-draft hint stays in this single file
 * so we tune all five from one place.
 */

export type StackKey = "lovable" | "v0" | "replit" | "bolt" | "cursor";

export type StackPageConfig = {
  key: StackKey;
  brand: string;
  brandUrl: string;
  brandColor: string;
  hero: string;
  subhero: string;
  pain: string;
  /** Sample draft hint shown in card with quotation mark — short. */
  sampleDraftQuote: string;
  /** What the URL looks like, used in the URL hint placeholder. */
  urlExample: string;
  /** Conventional Commits feat scope when shipping prompt updates. */
  promptScope: string;
};

export const STACK_PAGES: Record<StackKey, StackPageConfig> = {
  lovable: {
    key: "lovable",
    brand: "Lovable",
    brandUrl: "https://lovable.dev",
    brandColor: "#FF66A8",
    hero: "Just shipped a Lovable app? Get 17 platform-native launch posts in 10 seconds.",
    subhero:
      "VibeXForge knows what a *.lovable.app URL is — drafts auto-frame around 'built with Lovable in 2-3 days, no-code', not generic tech-stack jargon.",
    pain:
      "You vibe-coded a working app on Lovable in a weekend. Then it sits on a *.lovable.app URL because writing 10 platform-specific launch posts isn't what you signed up to do. Distribution is the wall most Lovable creators never get past.",
    sampleDraftQuote:
      "Built [your app] with Lovable in 2 days. No code. Live demo runs on *.lovable.app — paste it in, ship to 10+ channels.",
    urlExample: "https://my-app.lovable.app",
    promptScope: "lovable-detection",
  },
  v0: {
    key: "v0",
    brand: "v0",
    brandUrl: "https://v0.dev",
    brandColor: "#000000",
    hero: "Built with v0? Get 17 launch posts in 10 seconds — without rewriting your pitch 10 times.",
    subhero:
      "VibeXForge detects *.v0.dev URLs and writes drafts that lead with the prompt → component → ship loop, not generic startup-speak.",
    pain:
      "v0 turned your prompt into a working component in minutes. Now you have a deployed v0.dev URL and zero idea how to write the X / Reddit / HN / LinkedIn posts that match each platform's voice. The technical work is done — the launch work hasn't started.",
    sampleDraftQuote:
      "Prompted v0 → component live in 5 min → shipped. Distribution should be just as fast.",
    urlExample: "https://my-component.v0.dev",
    promptScope: "v0-detection",
  },
  replit: {
    key: "replit",
    brand: "Replit",
    brandUrl: "https://replit.com",
    brandColor: "#F26207",
    hero: "Shipping from Replit? Get 17 platform-native launch posts in 10 seconds.",
    subhero:
      "VibeXForge detects *.replit.app and *.repl.co URLs and frames drafts around 'shipped from the browser, no local setup'.",
    pain:
      "You built and deployed entirely in Replit — zero local environment, no docker, no terraform. The product works. The launch is ahead of you, and the platform-specific posts are 10 separate writing tasks you don't have time for.",
    sampleDraftQuote:
      "Built and shipped from Replit. Browser only, zero local setup. Live URL → 17 launch posts in 10 seconds, you're done.",
    urlExample: "https://my-repl.replit.app",
    promptScope: "replit-detection",
  },
  bolt: {
    key: "bolt",
    brand: "Bolt.new",
    brandUrl: "https://bolt.new",
    brandColor: "#3178C6",
    hero: "Built with Bolt.new? Launch posts written for you in 10 seconds.",
    subhero:
      "VibeXForge detects bolt.new URLs and writes drafts that emphasize speed — hours, not days.",
    pain:
      "You went from prompt to deployed app in hours. The build pace is the story — but you still have to translate that story into 10 platform conventions before anyone hears about it.",
    sampleDraftQuote:
      "Hours from prompt to deploy on Bolt.new. Now I just need 10 launch posts written in 10 platform voices — VibeX did it in 10 seconds.",
    urlExample: "https://bolt.new/my-project",
    promptScope: "bolt-detection",
  },
  cursor: {
    key: "cursor",
    brand: "Cursor",
    brandUrl: "https://cursor.com",
    brandColor: "#000000",
    hero: "Built with Cursor? Get 17 launch posts written for you in 10 seconds.",
    subhero:
      "Cursor users ship faster than they can write 10 platform-specific posts. VibeXForge fills that gap — paste your repo URL, get drafts tuned per platform.",
    pain:
      "Cursor compresses 'idea → working code' into hours. But the gap from 'working code' to 'someone outside my circle is using it' is still half a day of platform-by-platform launch writing. That's the wall.",
    sampleDraftQuote:
      "Cursor turned 3 days of code into 1 afternoon. Then VibeX turned half a day of launch posts into 10 seconds. Distribution finally caught up to building.",
    urlExample: "https://github.com/you/your-repo",
    promptScope: "cursor-detection",
  },
};
