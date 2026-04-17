import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Home",
  description:
    "Your VibeX dashboard. Launch a project, discover viral AI cards, tackle daily quests, and grow your creator reputation.",
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
    question: "What is VibeX?",
    answer:
      "VibeX is an AI-native launch platform where every project is a 16-bit RPG hero. Creators submit AI projects (URL or GitHub repo) and receive a Claude-scored review across originality, clarity, UX potential, virality potential, and investor curiosity. Projects evolve through six stages — Seed, Active, Growing, Breakout, Legend, Myth — based on real engagement (plays, upvotes, shares), not 24-hour upvote sprints. VibeX runs at https://www.vibexforge.com.",
  },
  {
    question: "How does the Claude review work?",
    answer:
      "Every submitted project is reviewed by Claude Haiku 4.5 against a published rubric. Claude reads the title, tagline, description, and (if the demo URL is a GitHub repo) the README, then returns five 0-100 scores, two to three named strengths, two to three weaknesses, and two to three actionable suggestions. The review is stored in the ai_reviews table and the compound score becomes projects.score, which in turn determines the project's starting evolution stage.",
  },
  {
    question: "How is a project's VibeX score calculated?",
    answer:
      "The compound score is the arithmetic mean of the five Claude dimensions: originality, clarity, UX potential, virality potential, and investor curiosity. Each dimension is 0-100. The compound is displayed as the project's headline score on its detail page and used as an aggregateRating when search engines index the page. The evolution stage is a separate function (compute_evolution_stage) that combines the compound score with live traction metrics (plays, upvotes, views, shares).",
  },
  {
    question: "What is VibeX's evolution system?",
    answer:
      "Every project progresses through six evolution stages tied to real engagement thresholds. Seed is the starting stage (score below 40 and low traction). Active requires 50+ plays or a compound score of 40+. Growing adds plays-500 and score-60 gates. Breakout requires plays-1000, upvotes-100, score-85, and Claude originality-70. Legend adds plays-5000 and score-85. Myth caps the ladder at plays-10000, upvotes-1000, investor-curiosity-80, score-90. The progression is driven by a Postgres trigger so no cron is needed.",
  },
  {
    question: "Is VibeX open source?",
    answer:
      "VibeX is source-available on GitHub at https://github.com/alex-jb/vibex under a custom VibeX Source Available License. Anyone can read, fork for personal use, and contribute back. Commercial hosting by third parties is restricted. The decision to use source-available instead of a permissive open-source license (MIT, Apache) was made by the solo founder (alex-jb) to preserve optionality during the early phase. The license may be revisited later.",
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
      <section className="sr-only" aria-label="Frequently asked questions about VibeX">
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
