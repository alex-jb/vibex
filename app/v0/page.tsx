import { StackLanding } from "@/components/stack-landing";
import { STACK_PAGES } from "@/lib/stack-pages";

export const metadata = {
  title: "VibeXForge for v0 creators — 17 launch posts in 10 seconds",
  description:
    "Built with Vercel v0? VibeXForge detects *.v0.dev URLs and writes 17 platform-native launch posts in 10 seconds — X / Reddit / HN / Xiaohongshu / Dev.to / LinkedIn and more. Free during beta.",
  alternates: { canonical: "https://www.vibexforge.com/v0" },
};

export default function Page() {
  return <StackLanding cfg={STACK_PAGES.v0} />;
}
