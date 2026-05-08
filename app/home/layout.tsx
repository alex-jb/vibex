import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Home",
  description:
    "Your VibeXForge dashboard. Launch a project, discover viral AI cards, tackle daily quests, and grow your creator reputation.",
  path: "/home",
});

// 5 definitional Q&A rendered as both JSON-LD (for AI Overviews,
// ChatGPT web search, Perplexity) and sr-only prose (for LLM
// crawlers that don't execute JS). Added 2026-04-17 per the /geo
// audit — Google AI Overviews readiness was 3/10 specifically
// because there was no answer-friendly Q&A structure anywhere.
//
// Keep these answers concrete and cite-worthy (specific numbers,
// named components). AI search re-quotes the `acceptedAnswer.text`
// verbatim; a vague answer means a vague citation.
const FAQ = [
  {
    question: "What is VibeXForge?",
    answer:
      "VibeXForge (formerly VibeX) is a distribution amplifier for solo AI creators. Submit your AI project URL or GitHub repo once and Claude Sonnet 4.6 generates 17 platform-native posts in roughly 10 seconds — covering X, Reddit, Hacker News, Dev.to, LinkedIn, Bluesky, Threads, Xiaohongshu (小红书), Jike (即刻), Zhihu (知乎), and Bilibili (B站). Each draft is written with platform-specific hook rules, length constraints, and tone — not the same text reformatted. Creators review inline, edit, and publish with one click. Bilingual EN ↔ ZH built in. Free during the beta. Live at https://www.vibexforge.com.",
  },
  {
    question: "How does VibeXForge generate the 17 drafts?",
    answer:
      "Each draft is produced by a separate Claude Sonnet 4.6 call running in parallel, with a platform-specific system prompt and a hard output-language directive. Hook rules forbid 'I built…' / '我做了…' openings — drafts must lead with a specific number, contrast, question, or pain moment. A number rule caps each post at two distinct figures and forbids repeating the same number. A length rule targets 70-95 percent of each platform's character cap. Total wall time is about 10 seconds because the calls fan out in parallel. Total cost per submission is roughly 6 cents.",
  },
  {
    question: "How does the cross-platform engagement tracking work?",
    answer:
      "After a creator marks a draft posted and pastes the published URL, a Vercel cron job runs every six hours and refreshes views, likes, and comments per draft using each platform's public read API. Reddit, Hacker News, Dev.to, Bluesky, and X are all supported via no-auth endpoints. Each scrape also writes an append-only snapshot row to draft_engagement_snapshots so the analytics page can render a 30-day curve, not just current totals. LinkedIn, Threads, Product Hunt, Xiaohongshu, Jike, Zhihu, and Bilibili require manual entry because they don't expose public engagement APIs.",
  },
  {
    question: "How is VibeXForge's bilingual support different from translation?",
    answer:
      "VibeXForge generates the EN and ZH drafts independently from one submit, not by translating one to the other. Platform conventions on Xiaohongshu, Jike, Zhihu, and Bilibili are structurally different from X, Reddit, and Hacker News — a translated tweet feels off on Xiaohongshu, and a translated 小红书笔记 feels off on Hacker News. So each (platform × language) tuple gets its own prompt. Creator-submitted English titles and descriptions also get translated to native Chinese via a daily Anthropic batch cron, with EN fallback rendering until the translation lands.",
  },
  {
    question: "Is VibeXForge open source?",
    answer:
      "VibeXForge is source-available on GitHub at https://github.com/alex-jb/vibex under a custom VibeX Source Available License. Anyone can read, fork for personal use, and contribute back. Commercial hosting by third parties is restricted. The decision to use source-available instead of a permissive open-source license (MIT, Apache) was made by the solo founder (alex-jb) to preserve optionality during the early phase. The marketing-agent draft generator, engagement scrapers, visual cover generator, and translator are all in the public repo; the production-tuned proprietary prompts and the full SQL migration history with RLS policies live in a private folder.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
      {/* Visually-hidden prose rendering of the same Q&A, rendered AFTER
          children so the page's real H1 comes first in DOM order. Moving
          this before {children} trips Lighthouse's heading-order audit
          (H2 → H1 non-sequential jump). Crawlers still pick this up:
          sr-only hides visually, not from screen readers or the
          accessibility tree. */}
      <section className="sr-only" aria-label="Frequently asked questions about VibeXForge">
        <h2>Frequently asked questions</h2>
        {FAQ.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </section>
    </>
  );
}
