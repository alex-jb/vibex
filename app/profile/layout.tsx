import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "My Profile",
  description: "View your RPG adventurer profile, stats, battle history, and achievement badges.",
  path: "/profile",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
