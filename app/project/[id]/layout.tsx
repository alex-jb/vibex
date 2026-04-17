import type { Metadata } from "next";
import { getProjectById } from "@/lib/db";
import { projects as mockProjects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

// Server-side resolver used by both generateMetadata and the default
// export (for JSON-LD). Tries the real DB first so user-submitted
// projects get proper metadata + schema; falls back to mock data for
// local dev and the seeded legacy IDs (1, 2, 9, ...).
async function resolveProject(id: string): Promise<Project | undefined> {
  try {
    const live = await getProjectById(id);
    if (live) return live;
  } catch {
    // ignore — fall through to mock
  }
  return mockProjects.find((p) => p.id === id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await resolveProject(id);

  if (!project) {
    return {
      title: "Project Not Found | VibeX",
    };
  }

  const title = `${project.title} | VibeX`;
  const description = project.tagline;
  const url = `https://www.vibexforge.com/project/${project.id}`;

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

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const project = await resolveProject(id);
  if (!project) return <>{children}</>;

  // Normalize Claude's 0-100 compound score (projects.score) to a 0-5
  // aggregateRating scale so Google can render SERP stars. ratingCount
  // uses upvotes (min 1 — schema requires a positive count) so the
  // rating is attributed to real engagement rather than fabricated.
  const ratingValue = Math.max(1, Math.min(5, (project.score / 100) * 5));
  const ratingCount = Math.max(1, project.upvotes || 1);

  const categoryToApplicationCategory: Record<string, string> = {
    "AI Agent": "BusinessApplication",
    "AI Tool": "DeveloperApplication",
    "AI Game": "GameApplication",
    "AI Workflow": "BusinessApplication",
    "AI Utility": "UtilitiesApplication",
    Experimental: "DeveloperApplication",
    Demo: "DeveloperApplication",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.tagline || project.description,
    url: `https://www.vibexforge.com/project/${project.id}`,
    applicationCategory:
      categoryToApplicationCategory[project.category] ?? "DeveloperApplication",
    operatingSystem: "Web",
    image: `https://www.vibexforge.com/project/${project.id}/opengraph-image`,
    datePublished: project.createdAt,
    author: project.creatorName
      ? {
          "@type": "Person",
          name: project.creatorName,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      "@id": "https://www.vibexforge.com/#org",
      name: "VibeX",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(2),
      bestRating: "5",
      worstRating: "0",
      ratingCount: String(ratingCount),
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
