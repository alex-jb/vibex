import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Creator Profile",
  description: "View creator profile on VibeX",
  path: "/profile",
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
