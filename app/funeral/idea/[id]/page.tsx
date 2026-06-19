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

async function fetchResurrections(funeralId: string): Promise<{ id: string; title: string }[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("projects")
    .select("id, title")
    .eq("from_idea_funeral_id", funeralId)
    .limit(5);
  return (data as { id: string; title: string }[] | null) || [];
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
  const resurrections = await fetchResurrections(id);

  // Benediction split — same treatment as /funeral/[id].
  const eulogy = f.eulogy.trim();
  let bodyText = eulogy;
  let benediction: string | null = null;
  const trimmedEnd = eulogy.search(/[.!?…]\s*$/);
  if (trimmedEnd > 0) {
    const head = eulogy.slice(0, trimmedEnd + 1);
    const priorBreak = Math.max(
      head.lastIndexOf(". ", head.length - 2),
      head.lastIndexOf("! ", head.length - 2),
      head.lastIndexOf("? ", head.length - 2),
    );
    const start = priorBreak > 0 ? priorBreak + 2 : Math.max(0, eulogy.length - 140);
    const candidate = eulogy.slice(start).trim();
    if (candidate.length >= 12 && candidate.length <= 200) {
      bodyText = eulogy.slice(0, start).trim();
      benediction = candidate;
    }
  }

  const parchmentBg = "var(--funeral-parchment)";
  const burgundy = "var(--funeral-burgundy)";
  const ink = "#1a0508";
  const smoke = "#6b6258";

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: parchmentBg, color: ink }}
    >
      <div className="mx-auto max-w-3xl">
        <article
          className="relative overflow-hidden rounded-sm shadow-2xl"
          style={{
            background: parchmentBg,
            borderTop: `4px solid ${burgundy}`,
            borderBottom: `4px solid ${burgundy}`,
            boxShadow:
              "inset 0 8px 16px -8px rgba(74, 20, 25, 0.18), 0 24px 48px -24px rgba(74, 20, 25, 0.35)",
          }}
        >
          {/* Mascot badge — 💭 placeholder for the dreamed-of-idea variant. */}
          <div
            aria-hidden="true"
            className="absolute left-6 top-6 select-none text-4xl"
            style={{ color: burgundy }}
          >
            💭
          </div>

          <header className="px-8 pb-2 pt-14 text-center">
            <h1
              className="font-eulogy italic"
              style={{
                color: burgundy,
                fontSize: "clamp(2.25rem, 5vw + 1rem, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.05,
              }}
            >
              {f.deceased_name}
            </h1>
            {f.category && (
              <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: smoke }}>
                {f.category}
              </p>
            )}
            {f.age_when_buried && (
              <p className="mt-1.5 text-xs" style={{ color: smoke }}>
                {f.age_when_buried}
              </p>
            )}
          </header>

          {f.ash_image_url && (
            <div className="mx-auto mt-6 max-w-md px-8">
              <img
                src={f.ash_image_url}
                alt={`Memorial for ${f.deceased_name}`}
                className="w-full rounded-sm"
                style={{ border: `1px solid ${burgundy}` }}
              />
            </div>
          )}

          <div className="eulogy-block px-8 pb-8 pt-8">
            <p
              className="font-eulogy whitespace-pre-wrap"
              style={{ color: ink, fontSize: "20px", lineHeight: 1.7, fontWeight: 400 }}
            >
              {bodyText}
            </p>

            {benediction && (
              <>
                <div
                  aria-hidden="true"
                  className="mx-auto my-7 h-px w-40"
                  style={{ background: "var(--brand-cream)", opacity: 0.85 }}
                />
                <p
                  className="font-eulogy italic"
                  style={{
                    color: ink,
                    fontSize: "20px",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {benediction}
                </p>
              </>
            )}

            {f.mourner_name && (
              <p
                className="mt-8 text-right font-eulogy italic"
                style={{ color: smoke, fontSize: "14px" }}
              >
                — read by {f.mourner_name}
              </p>
            )}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                .eulogy-block p:first-of-type::first-letter {
                  font-family: var(--font-eulogy), "Cormorant Garamond", serif;
                  font-weight: 700;
                  font-size: 56px;
                  line-height: 0.9;
                  color: ${burgundy};
                  float: left;
                  padding: 4px 10px 0 0;
                  font-feature-settings: "liga", "kern";
                }
              `,
            }}
          />
        </article>

        {resurrections.length > 0 && (
          <aside
            className="mt-8 rounded-sm px-6 py-5"
            style={{
              background: "rgba(74, 20, 25, 0.06)",
              border: `1px solid ${burgundy}`,
            }}
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: burgundy }}>
              Now lives as
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {resurrections.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/project/${p.id}`}
                    className="underline hover:no-underline"
                    style={{ color: burgundy }}
                  >
                    → {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <details
          className="mt-6 rounded-sm p-4 text-sm"
          style={{
            background: "rgba(74, 20, 25, 0.04)",
            border: `1px solid ${burgundy}`,
            color: ink,
          }}
        >
          <summary className="cursor-pointer font-medium" style={{ color: burgundy }}>
            The original idea (as told to me)
          </summary>
          <p className="mt-3 whitespace-pre-wrap leading-6">{f.idea_text}</p>
        </details>

        {(() => {
          const tweetText =
            `RIP "${f.deceased_name}" — someone buried an idea today. ` +
            `it lived only in their head${f.age_when_buried ? ` (${f.age_when_buried})` : ""}. ` +
            `AI wrote it a proper eulogy:`;
          const memorialUrl = `https://www.vibexforge.com/funeral/idea/${f.id}`;
          const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(memorialUrl)}`;
          const redditIntent = `https://www.reddit.com/r/SideProject/submit?title=${encodeURIComponent(`Someone buried an idea today. The eulogy was for "${f.deceased_name}"`)}&url=${encodeURIComponent(memorialUrl)}`;
          const shareBtn =
            "flex-1 rounded-sm px-4 py-3 text-center text-sm font-semibold transition";
          const shareStyle = {
            background: parchmentBg,
            color: burgundy,
            border: `1px solid ${burgundy}`,
          } as const;
          return (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {/* Orange Tweet button preserved per spec — conversion path */}
              <a
                href={tweetIntent}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-sm bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
              >
                𝕏 Share the eulogy
              </a>
              <a
                href={redditIntent}
                target="_blank"
                rel="noreferrer"
                className={shareBtn}
                style={shareStyle}
              >
                Share to r/SideProject
              </a>
              <Link
                href="/validator"
                className={shareBtn}
                style={shareStyle}
              >
                Validate the next one →
              </Link>
            </div>
          );
        })()}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/funeral/idea"
            className="flex-1 rounded-sm px-4 py-3 text-center text-sm font-medium"
            style={{
              background: parchmentBg,
              color: burgundy,
              border: `1px solid ${burgundy}`,
            }}
          >
            Bury another
          </Link>
          <Link
            href="/funeral/wall"
            className="flex-1 rounded-sm px-4 py-3 text-center text-sm font-medium"
            style={{
              background: parchmentBg,
              color: burgundy,
              border: `1px solid ${burgundy}`,
            }}
          >
            Public wall →
          </Link>
        </div>

        <footer className="mt-16 text-center text-xs" style={{ color: smoke }}>
          {f.view_count > 0 && `${f.view_count} mourners visited · `}
          A side project of{" "}
          <Link href="/" className="underline hover:no-underline" style={{ color: burgundy }}>
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
