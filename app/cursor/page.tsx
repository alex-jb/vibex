import { StackLanding } from "@/components/stack-landing";
import { STACK_PAGES } from "@/lib/stack-pages";

export const metadata = {
  title: "VibeXForge for Cursor creators — 17 launch posts in 10 seconds",
  description:
    "Built with Cursor? VibeXForge writes 17 platform-native launch posts for your repo in 10 seconds — X / Reddit / HN / Xiaohongshu / Dev.to / LinkedIn and more. Free during beta.",
  alternates: { canonical: "https://www.vibexforge.com/cursor" },
};

export default function Page() {
  return <StackLanding cfg={STACK_PAGES.cursor} />;
}
