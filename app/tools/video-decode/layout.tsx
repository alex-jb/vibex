import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Decoder · VibeXForge",
  description:
    "Paste a Douyin (抖音) or Xiaohongshu (小红书) link. Gemini 2.5 Flash watches the video and returns the first-3-second hook formula, rhythm beats, CTA placement, emotional hook, and 3 remix scripts in ~30 seconds. 3 free per day, $5 for 100.",
  openGraph: {
    title: "AI Video Decoder · paste 抖音/小红书 link, get the hook",
    description:
      "Gemini 2.5 Flash watches the video. Returns hook formula, rhythm, CTA, emotional hook, 3 remix scripts. ~30s. $5/100 decodes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Decoder",
    description: "Paste 抖音/小红书 link → AI watches → hook structure + 3 remix scripts",
  },
};

export default function VideoDecodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
