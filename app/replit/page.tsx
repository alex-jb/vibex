import { StackLanding } from "@/components/stack-landing";
import { STACK_PAGES } from "@/lib/stack-pages";

export const metadata = {
  title: "VibeXForge for Replit creators — 17 launch posts in 10 seconds",
  description:
    "Shipping from Replit? VibeXForge detects *.replit.app and *.repl.co URLs and writes 17 platform-native launch posts in 10 seconds — X / Reddit / HN / Xiaohongshu / Dev.to / LinkedIn and more. Free during beta.",
  alternates: { canonical: "https://www.vibexforge.com/replit" },
};

export default function Page() {
  return <StackLanding cfg={STACK_PAGES.replit} />;
}
