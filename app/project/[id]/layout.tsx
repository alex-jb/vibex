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
    // Fall-through metadata: Lighthouse occasionally caught /project/2
    // in a state where project resolution returned undefined (likely a
    // transient DB-fetch race in the audit's first crawl). Without a
    // description here the page briefly advertised no meta description
    // and cost 8 SEO points. Defense-in-depth: every metadata path
    // carries a usable description.
    return {
      title: "Project Not Found | VibeX",
      description:
        "This project page is unavailable. Browse all launched AI projects on VibeX — the launch platform where projects evolve from Seed to Myth based on real traction, scored by Claude across five dimensions.",
    };
  }

  const title = `${project.title} | VibeX`;
  // Compose a 140-180 char description so Lighthouse / Google don't flag
  // it as too short. Taglines are typically 40-80 chars; appending the
  // category + Claude compound score + creator context reliably lands
  // in the sweet spot while surfacing the data points most useful for
  // search-result snippets (category, score).
  const baseTagline = (project.tagline || "").trim();
  const creatorPart = project.creatorName ? ` by ${project.creatorName}` : "";
  const scorePart = project.score > 0 ? ` · Claude score ${project.score}/100` : "";
  const description =
    `${baseTagline} — ${project.category} project on VibeX${creatorPart}${scorePart}. An AI-native launch platform where projects evolve from Seed to Myth on real traction.`
      .replace(/\s+/g, " ")
      .slice(0, 200);
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
