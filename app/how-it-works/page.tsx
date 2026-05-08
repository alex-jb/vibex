import HowItWorksClient from "./how-it-works-client";

export const metadata = {
  title: "How VibeXForge works — Distribution amplifier for solo AI creators",
  description:
    "Submit your AI app once. Our agents auto-promote to 10+ channels (X / Xiaohongshu / Jike / Reddit / Dev.to / HN / LinkedIn / Bluesky / Threads / Product Hunt). Solo creators get the multi-channel reach big companies pay $10K/month for.",
};

// JSON-LD: Article + FAQPage. Article tells Google AI Overviews +
// Perplexity that this page is a definitional explainer about how
// VibeXForge works, with a stable URL + author + date. FAQPage gives
// the same Q&A coverage as /home so AI search has redundant cite
// targets. Speakable selectors point voice surfaces at the hero +
// step descriptions.
const HOW_IT_WORKS_FAQ = [
  {
    question: "How long does it take to generate the drafts?",
    answer:
      "Roughly 10 seconds. The 17 platform-native drafts are generated in parallel — one Claude Sonnet 4.6 call per (platform × language × variant) tuple, fanned out concurrently. Wall time is dominated by the slowest single call, not the sum.",
  },
  {
    question: "Which platforms does VibeXForge cover?",
    answer:
      "X, Reddit, Hacker News, Dev.to, LinkedIn, Bluesky, Threads, Product Hunt, Xiaohongshu (小红书), Jike (即刻), Zhihu (知乎), and Bilibili (B站). Each gets its own platform-specific system prompt — no copy-pasted text across platforms.",
  },
  {
    question: "How is bilingual support different from translation?",
    answer:
      "EN and ZH drafts are generated independently from one submit, not by translating one to the other. Platform conventions on Xiaohongshu, Jike, Zhihu, and Bilibili are structurally different from X, Reddit, and Hacker News, so each (platform × language) tuple gets its own prompt rather than a translate-after step.",
  },
  {
    question: "Does VibeXForge auto-publish to my accounts?",
    answer:
      "No. Every draft requires a human approval step. After review, clicking Open Platform either pre-fills the platform's compose form (X, Reddit, HN, Bluesky, Threads) or opens the platform with the text auto-copied to clipboard (LinkedIn, Dev.to, Xiaohongshu, Jike, Zhihu, Bilibili) for one-paste publishing. The creator's account name is on every post — they always confirm before it goes live.",
  },
  {
    question: "How is engagement tracked across platforms?",
    answer:
      "After a creator marks a draft posted and pastes the published URL, a Vercel cron job runs every six hours and refreshes views, likes, and comments per draft using each platform's public read API. Reddit, Hacker News, Dev.to, Bluesky, and X are supported. The data feeds the cross-platform analytics page where creators see which channel is converting best plus a 30-day trend sparkline per platform.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Free during beta. Each generation consumes 21 credits against a default daily quota of 100 per creator — generous enough for ~5 full launches plus rerolls without hitting the cap. Future pricing has not been finalized; current candidates are a flat monthly subscription or a 15% take-rate on revenue earned through platform-tracked referrals.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://www.vibexforge.com/how-it-works",
  headline: "How VibeXForge works — Distribution amplifier for solo AI creators",
  description:
    "Submit your AI app once. Our agents auto-promote to 10+ channels.",
  author: { "@id": "https://www.vibexforge.com/#founder" },
  publisher: { "@id": "https://www.vibexforge.com/#org" },
  datePublished: "2026-05-08",
  dateModified: "2026-05-08",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.vibexforge.com/how-it-works",
  },
  inLanguage: ["en", "zh-CN"],
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".faq-answer"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOW_IT_WORKS_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HowItWorksClient />
      {/* Visually-hidden FAQ prose for crawlers that don't execute JS.
          Same content as the FAQPage JSON-LD. */}
      <section
        className="sr-only"
        aria-label="Frequently asked questions about how VibeXForge works"
      >
        <h2>How VibeXForge works · FAQ</h2>
        {HOW_IT_WORKS_FAQ.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p className="faq-answer">{item.answer}</p>
          </div>
        ))}
      </section>
    </>
  );
}
