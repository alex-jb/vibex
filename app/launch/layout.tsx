import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Launch Your Project",
  description: "Give your AI creation the stage it deserves. Submit and get instant AI-powered feedback.",
  path: "/launch",
});

const LAUNCH_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.vibexforge.com/launch",
      url: "https://www.vibexforge.com/launch",
      name: "Launch Your AI Project on VibeXForge",
      description:
        "Submit your AI project, get a Claude-scored review in seconds, and reach 12 platforms with bilingual posts auto-generated for X, Reddit, HN, Dev.to, LinkedIn, Bluesky, Threads, Xiaohongshu, Jike, Zhihu, Bilibili, and Product Hunt.",
      isPartOf: { "@id": "https://www.vibexforge.com/#website" },
      about: { "@id": "https://www.vibexforge.com/#product" },
      potentialAction: {
        "@type": "CreateAction",
        target: "https://www.vibexforge.com/launch",
        name: "Submit AI project",
      },
    },
    {
      "@type": "HowTo",
      "@id": "https://www.vibexforge.com/launch#howto",
      name: "How to launch your AI project on VibeXForge",
      description:
        "3 steps from idea to 12-platform launch in under 60 seconds.",
      totalTime: "PT1M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Describe your project",
          text: "Title, tagline, category, and a short description. Bilingual EN ↔ ZH supported.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Get Claude review",
          text: "5-dimension Claude-scored review with concrete, actionable items in seconds.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Publish to 12 platforms",
          text: "Platform-native posts auto-generated for X, Reddit, HN, Dev.to, LinkedIn, Bluesky, Threads, Xiaohongshu, Jike, Zhihu, Bilibili, Product Hunt.",
        },
      ],
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LAUNCH_JSONLD) }}
      />
      {children}
    </>
  );
}
