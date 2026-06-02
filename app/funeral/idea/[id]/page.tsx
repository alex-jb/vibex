import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface IdeaFuneral {
  id: string;
  idea_text: string;
  deceased_name: string;
  category: string | null;
  age_when_buried: string | null;
  eulogy: string;
  ash_image_url: string | null;
  mourner_name: string | null;
  created_at: string;
  view_count: number;
  share_count: number;
}

async function fetchIdeaFuneral(id: string): Promise<IdeaFuneral | null> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return null;
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("idea_funerals")
    .select(
      "id, idea_text, deceased_name, category, age_when_buried, eulogy, ash_image_url, mourner_name, created_at, view_count, share_count",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const f = await fetchIdeaFuneral(id);
  if (!f) return { title: "Memorial not found" };
  const title = `💭 Memorial for ${f.deceased_name}`;
  const description = f.eulogy.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: f.ash_image_url ? [f.ash_image_url] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: f.ash_image_url ? [f.ash_image_url] : [],
    },
  };
}

export default async function IdeaFuneralMemorialPage({ params }: PageProps) {
  const { id } = await params;
  const f = await fetchIdeaFuneral(id);
  if (!f) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <div className="mb-3 text-5xl">💭</div>
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
            {f.deceased_name}
          </h1>
          {f.category && (
            <p className="mt-2 text-sm uppercase tracking-wider text-zinc-500">
              {f.category}
            </p>
          )}
          {f.age_when_buried && (
            <p className="mt-1 text-xs text-zinc-600">
              {f.age_when_buried}
            </p>
          )}
        </header>

        {f.ash_image_url && (
          <img
            src={f.ash_image_url}
            alt={`Memorial for ${f.deceased_name}`}
            className="mx-auto mb-8 max-w-md rounded-2xl ring-1 ring-zinc-800"
          />
        )}

        <article className="rounded-2xl bg-black/40 p-8 ring-1 ring-zinc-800">
          <p className="whitespace-pre-wrap font-serif text-lg leading-8 text-zinc-100">
            {f.eulogy}
          </p>
          {f.mourner_name && (
            <p className="mt-6 text-right text-sm italic text-zinc-500">
              — read by {f.mourner_name}
            </p>
          )}
        </article>

        <details className="mt-6 rounded-2xl bg-zinc-900/40 p-4 text-sm text-zinc-400 ring-1 ring-zinc-800">
          <summary className="cursor-pointer font-medium text-zinc-300">
            The original idea (as told to me)
          </summary>
          <p className="mt-3 whitespace-pre-wrap leading-6">{f.idea_text}</p>
        </details>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/validator"
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
          >
            Validate the next one →
          </Link>
          <Link
            href="/funeral/idea"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Bury another
          </Link>
          <Link
            href="/funeral/wall"
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800"
          >
            Public wall →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          {f.view_count > 0 && `${f.view_count} mourners visited · `}
          A side project of{" "}
          <Link href="/" className="text-orange-400 hover:underline">
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
