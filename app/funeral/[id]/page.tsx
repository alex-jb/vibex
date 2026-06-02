import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { RevivalPanel } from "@/components/funeral/revival-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Funeral {
  id: string;
  github_url: string;
  repo_owner: string;
  repo_name: string;
  deceased_name: string;
  deceased_at: string | null;
  stars: number;
  forks: number;
  language: string | null;
  age_days_alive: number | null;
  eulogy: string;
  ash_image_url: string | null;
  mourner_name: string | null;
  created_at: string;
  view_count: number;
  share_count: number;
  revival_judgment: {
    worth_reviving: boolean;
    confidence: number;
    pivot_angles: string[];
    rename_suggestion: string;
    vibex_relaunch_prompt: string;
    one_line_verdict: string;
  } | null;
}

async function fetchFuneral(id: string): Promise<Funeral | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("funerals")
    .select(
      "id, github_url, repo_owner, repo_name, deceased_name, deceased_at, stars, forks, language, age_days_alive, eulogy, ash_image_url, mourner_name, created_at, view_count, share_count, revival_judgment",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const funeral = await fetchFuneral(id);
  if (!funeral) return { title: "Funeral not found" };
  const title = `🕯️ Memorial for ${funeral.deceased_name}`;
  const description = funeral.eulogy.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: funeral.ash_image_url ? [funeral.ash_image_url] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: funeral.ash_image_url ? [funeral.ash_image_url] : [],
    },
  };
}

export default async function FuneralMemorialPage({ params }: PageProps) {
  const { id } = await params;
  const funeral = await fetchFuneral(id);
  if (!funeral) notFound();

  const sinceDeath = funeral.deceased_at
    ? Math.floor(
        (Date.now() - new Date(funeral.deceased_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <div className="mb-3 text-5xl">🕯️</div>
          <h1 className="font-serif text-4xl font-bold">
            {funeral.deceased_name}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {funeral.repo_owner}/{funeral.repo_name}
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            ⭐ {funeral.stars} · 🍴 {funeral.forks}
            {funeral.language && ` · ${funeral.language}`}
            {funeral.age_days_alive !== null &&
              ` · lived ${funeral.age_days_alive} days`}
            {sinceDeath !== null && ` · silent ${sinceDeath} days`}
          </p>
        </header>

        {funeral.ash_image_url && (
          <img
            src={funeral.ash_image_url}
            alt={`Ash memorial for ${funeral.deceased_name}`}
            className="mx-auto mb-8 max-w-md rounded-2xl ring-1 ring-zinc-800"
          />
        )}

        <article className="rounded-2xl bg-black/40 p-8 ring-1 ring-zinc-800">
          <p className="whitespace-pre-wrap font-serif text-lg leading-8 text-zinc-100">
            {funeral.eulogy}
          </p>
          {funeral.mourner_name && (
            <p className="mt-6 text-right text-sm italic text-zinc-500">
              — read by {funeral.mourner_name}
            </p>
          )}
        </article>

        <RevivalPanel funeralId={funeral.id} prefetched={funeral.revival_judgment} />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={funeral.github_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Visit the body →
          </a>
          <Link
            href="/funeral"
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            Bury another project
          </Link>
          <Link
            href="/funeral/wall"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Public wall →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          {funeral.view_count > 0 && `${funeral.view_count} mourners visited · `}
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
