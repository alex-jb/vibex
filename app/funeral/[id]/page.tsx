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

async function fetchResurrections(funeralId: string): Promise<{ id: string; title: string }[]> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_ANON_KEY) return [];
  const supa = createClient(SUPA_URL, SUPA_ANON_KEY);
  const { data } = await supa
    .from("projects")
    .select("id, title")
    .eq("from_funeral_id", funeralId)
    .limit(5);
  return (data as { id: string; title: string }[] | null) || [];
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
  const resurrections = await fetchResurrections(id);

  // server component renders fresh per request — Date.now() impurity is fine
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const sinceDeath = funeral.deceased_at
    ? Math.floor(
        (now - new Date(funeral.deceased_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Benediction split — render the eulogy as body + last sentence styled
  // as a centered italic benediction with a candle-gold divider above.
  // Server-side splitting to keep this a pure server component.
  // Per docs/specs/2026-06-14-funeral-visual-upgrade-spec.md memorial layout.
  const eulogy = funeral.eulogy.trim();
  const lastSplit = eulogy.search(/[.!?…]\s*$/);
  let bodyText = eulogy;
  let benediction: string | null = null;
  if (lastSplit > 0) {
    // Find the start of the last sentence by walking back to the previous
    // sentence terminator. Falls back to last 140 chars if no prior
    // terminator (single long block).
    const trimmedEnd = eulogy.slice(0, lastSplit + 1);
    const priorBreak = Math.max(
      trimmedEnd.lastIndexOf(". ", trimmedEnd.length - 2),
      trimmedEnd.lastIndexOf("! ", trimmedEnd.length - 2),
      trimmedEnd.lastIndexOf("? ", trimmedEnd.length - 2),
    );
    const start = priorBreak > 0 ? priorBreak + 2 : Math.max(0, eulogy.length - 140);
    const candidate = eulogy.slice(start).trim();
    // Only promote as benediction if it's a reasonable last-sentence length.
    if (candidate.length >= 12 && candidate.length <= 200) {
      bodyText = eulogy.slice(0, start).trim();
      benediction = candidate;
    }
  }

  // Style tokens reused across the parchment surface.
  const parchmentBg = "var(--funeral-parchment)";
  const burgundy = "var(--funeral-burgundy)";
  const ink = "#1a0508"; // darker than burgundy for body legibility on parchment
  const smoke = "#6b6258"; // smoke-on-parchment metadata color

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: parchmentBg, color: ink }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Parchment scroll card with burgundy ribbon borders top + bottom.
            The ribbons read as "the ends of an unrolled scroll" per spec. */}
        <article
          className="relative overflow-hidden rounded-sm shadow-2xl"
          style={{
            background: parchmentBg,
            // 4px burgundy ribbons top + bottom
            borderTop: `4px solid ${burgundy}`,
            borderBottom: `4px solid ${burgundy}`,
            boxShadow:
              "inset 0 8px 16px -8px rgba(74, 20, 25, 0.18), 0 24px 48px -24px rgba(74, 20, 25, 0.35)",
          }}
        >
          {/* Mascot badge top-left — 🕯️ placeholder for the mourning lamb. */}
          <div
            aria-hidden="true"
            className="absolute left-6 top-6 select-none text-4xl"
            style={{ color: burgundy }}
          >
            🕯️
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
              {funeral.deceased_name}
            </h1>
            <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: smoke }}>
              {funeral.repo_owner} · {funeral.repo_name}
            </p>
            <p className="mt-1.5 text-xs" style={{ color: smoke }}>
              {funeral.stars} stars · {funeral.forks} forks
              {funeral.language && ` · ${funeral.language}`}
              {funeral.age_days_alive !== null && ` · lived ${funeral.age_days_alive} days`}
              {sinceDeath !== null && ` · silent ${sinceDeath} days`}
            </p>
          </header>

          {funeral.ash_image_url && (
            <div className="mx-auto mt-6 max-w-md px-8">
              <img
                src={funeral.ash_image_url}
                alt={`Ash memorial for ${funeral.deceased_name}`}
                className="w-full rounded-sm"
                style={{ border: `1px solid ${burgundy}` }}
              />
            </div>
          )}

          {/* Eulogy body — Cormorant Garamond 400 with a 56px burgundy
              drop-cap on the first letter via .font-eulogy-body utility. */}
          <div className="eulogy-block px-8 pb-8 pt-8">
            <p
              className="font-eulogy whitespace-pre-wrap"
              style={{
                color: ink,
                fontSize: "20px",
                lineHeight: 1.7,
                fontWeight: 400,
              }}
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

            {funeral.mourner_name && (
              <p
                className="mt-8 text-right font-eulogy italic"
                style={{ color: smoke, fontSize: "14px" }}
              >
                — read by {funeral.mourner_name}
              </p>
            )}
          </div>

          {/* Drop-cap injected as scoped style — :first-letter targets the
              first paragraph child of .eulogy-block. */}
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

        {/* Resurrection callout — kept on parchment surface with burgundy ink */}
        {resurrections.length > 0 && (
          <aside
            className="mt-8 rounded-sm px-6 py-5"
            style={{
              background: "rgba(74, 20, 25, 0.06)",
              border: `1px solid ${burgundy}`,
            }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: burgundy }}
            >
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

        {/* Revival panel kept on dark elevation surface on purpose — the
            modern intrusion that breaks the ritual moment and signals
            "back to product reality." Per spec anti-pattern guidance. */}
        <div className="mt-8">
          <RevivalPanel funeralId={funeral.id} prefetched={funeral.revival_judgment} />
        </div>

        {(() => {
          const tweetText =
            `RIP ${funeral.deceased_name}. ` +
            `lived ${funeral.age_days_alive ?? "?"} days, ` +
            `${funeral.stars} stars, ${funeral.forks} forks. ` +
            `someone wrote it a proper eulogy:`;
          const memorialUrl = `https://www.vibexforge.com/funeral/${funeral.id}`;
          const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(memorialUrl)}`;
          const redditIntent = `https://www.reddit.com/r/SideProject/submit?title=${encodeURIComponent(`RIP ${funeral.deceased_name} — someone gave it a proper funeral`)}&url=${encodeURIComponent(memorialUrl)}`;
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
              <a
                href={funeral.github_url}
                target="_blank"
                rel="noreferrer"
                className={shareBtn}
                style={shareStyle}
              >
                Visit the body →
              </a>
            </div>
          );
        })()}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/funeral"
            className="flex-1 rounded-sm px-4 py-3 text-center text-sm font-medium"
            style={{
              background: parchmentBg,
              color: burgundy,
              border: `1px solid ${burgundy}`,
            }}
          >
            Bury another project
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

        <footer
          className="mt-16 text-center text-xs"
          style={{ color: smoke }}
        >
          {funeral.view_count > 0 && `${funeral.view_count} mourners visited · `}
          A side project of{" "}
          <Link href="/" className="underline hover:no-underline" style={{ color: burgundy }}>
            VibeXForge
          </Link>
        </footer>
      </div>
    </main>
  );
}
