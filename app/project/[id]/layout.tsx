import type { Metadata } from "next";
import { projects } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return {
      title: "Project Not Found | VibeX",
    };
  }

  const title = `${project.title} | VibeX`;
  const description = project.tagline;
  const url = `https://vibexforge.com/project/${project.id}`;

  // Images are auto-resolved from app/project/[id]/opengraph-image.tsx — don't
  // pass an explicit `images:` array here or it will override the dynamic one.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "VibeX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
