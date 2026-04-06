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
      title: "Project Not Found | VibeCode Hunt",
    };
  }

  const title = `${project.title} | VibeCode Hunt`;
  const description = project.tagline;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://vibecode.hunt/project/${project.id}`,
      siteName: "VibeCode Hunt",
      type: "website",
      images: [
        {
          url: project.thumbnail || "/og-default.png",
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.thumbnail || "/og-default.png"],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
