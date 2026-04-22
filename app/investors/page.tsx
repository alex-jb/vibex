/**
 * /investors — VC-facing landing page. Plays the 2:20 pitch video inline,
 * shows the ask block, and points to the booking link.
 *
 * Designed for cold-email CTAs: instead of attaching the MP4 (which
 * Gmail limits at 25 MB and clips previews of), link recipients here.
 * Page is fully static server-rendered — no auth, no DB calls.
 *
 * Locale toggle at top swaps the video source without a page
 * reload — both MP4s are in /public/demo-assets/.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VibeXForge for Investors — 2-minute pitch",
  description:
    "A forge for AI creators with live Claude critiques and public evolution. 2-minute pitch video + ask + booking link. Solo-built, open source, live in open beta.",
  openGraph: {
    title: "VibeXForge for Investors",
    description:
      "A 2-minute pitch on the growth layer for AI creators.",
    images: ["/generated/og-vibex.png"],
  },
};

const COLOR = {
  BG: "#0A0A0C",
  PANEL: "#14141A",
  BORDER: "#2A2A30",
  FORGE: "#FF4500",
  FORGE_CREAM: "#FFE27D",
  TEXT: "#E8E8EC",
  TEXT_MUTED: "#8B7AA0",
  TEXT_DIM: "#4A4050",
  GREEN: "#39FF14",
};

const ASK = [
  {
    icon: "◉",
    tag: "SEED",
    body: "pre-seed to seed · $250K–$1M · 6-9 month runway",
  },
  {
    icon: "⬢",
    tag: "DESIGN PARTNER",
    body: "AI maker willing to submit their project as a cohort-0 design partner",
  },
  {
    icon: "✦",
    tag: "ADVISOR",
    body: "growth / community / gamification mechanics expertise",
  },
];

const STATS = [
  { label: "DB TABLES", value: "43" },
  { label: "API ROUTES", value: "57" },
  { label: "REACT COMPONENTS", value: "119" },
  { label: "BILINGUAL i18n KEYS", value: "925+" },
];

// When you set up Cal.com / Calendly, swap `cal` to that URL and the
// CTA button auto-upgrades from "email to schedule" to "book directly".
// Swap `email` to a branded alias (alex@vibexforge.com) once the
// domain email is configured.
const CONTACT = {
  email: "xji1@mail.yu.edu",
  cal: "mailto:xji1@mail.yu.edu?subject=VibeXForge%20%E2%80%94%2015%20min%20chat&body=Hi%20Alex%2C%0A%0AI%27d%20like%20to%20chat%20about%20VibeXForge.%20A%2015-minute%20slot%20that%20works%20for%20you%3F%0A%0AThanks%2C",
  github: "https://github.com/alex-jb/vibex",
};

export default function VCPage() {
  return (
    <main
      className="min-h-full"
      style={{ background: COLOR.BG, color: COLOR.TEXT }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Terminal header */}
        <div
          style={{
            background: COLOR.BG,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${COLOR.BORDER}`,
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF5F57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FEBC2E", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#28C840", display: "inline-block" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 10, color: COLOR.FORGE, letterSpacing: 3 }}>
            {">"} VIBEXFORGE://FOR_INVESTORS
          </span>
          <span className="font-pixel" style={{ fontSize: 8, color: COLOR.TEXT_DIM }}>
            2026-Q2
          </span>
        </div>

        {/* Hero */}
        <header style={{ marginBottom: 48 }}>
          <h1
            className="font-pixel"
            style={{
              fontSize: 48,
              color: COLOR.FORGE,
              letterSpacing: 6,
              lineHeight: 1.15,
              textShadow: `4px 4px 0 #000, 0 0 30px ${COLOR.FORGE}66`,
              marginBottom: 16,
            }}
          >
            VIBEXFORGE
          </h1>
          <p
            className="font-retro"
            style={{
              fontSize: 26,
              color: COLOR.TEXT,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            The growth layer for AI creators.
          </p>
          <p
            className="font-retro"
            style={{
              fontSize: 20,
              color: COLOR.TEXT_MUTED,
              letterSpacing: 1,
            }}
          >
            Forged. Critiqued by Claude. Evolving on real traction.
          </p>
        </header>

        {/* Video — 2:20 pitch */}
        <section style={{ marginBottom: 56 }}>
          <div
            className="font-pixel"
            style={{
              fontSize: 12,
              color: COLOR.FORGE,
              letterSpacing: 3,
              marginBottom: 12,
            }}
          >
            ▸ 2-MINUTE PITCH · SILENT WITH CAPTIONS
          </div>
          <div
            style={{
              position: "relative",
              border: `2px solid ${COLOR.FORGE}`,
              boxShadow: `0 0 40px ${COLOR.FORGE}44`,
              overflow: "hidden",
            }}
          >
            <video
              src="/demo-assets/vibex-demo-vc-v1.mp4"
              controls
              preload="metadata"
              playsInline
              poster="/generated/og-vibex.png"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
          <p
            className="font-retro"
            style={{
              fontSize: 16,
              color: COLOR.TEXT_DIM,
              marginTop: 8,
            }}
          >
            中文版: <a href="/demo-assets/vibex-demo-vc-v1-zh.mp4" style={{ color: COLOR.FORGE_CREAM }}>vibex-demo-vc-v1-zh.mp4</a>
          </p>
        </section>

        {/* Traction stats */}
        <section style={{ marginBottom: 56 }}>
          <div
            className="font-pixel"
            style={{
              fontSize: 12,
              color: COLOR.FORGE,
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            ▸ SHIPPED · NOT SLIDES
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: 20,
                  background: COLOR.PANEL,
                  border: `1px solid ${COLOR.BORDER}`,
                }}
              >
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 36,
                    color: COLOR.TEXT,
                    marginBottom: 6,
                  }}
                >
                  {s.value}
                </div>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 10,
                    color: COLOR.TEXT_MUTED,
                    letterSpacing: 2,
                  }}
                >
                  ▸ {s.label}
                </div>
              </div>
            ))}
          </div>
          <div
            className="font-retro"
            style={{
              fontSize: 18,
              color: COLOR.GREEN,
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: COLOR.GREEN,
                boxShadow: `0 0 10px ${COLOR.GREEN}`,
                display: "inline-block",
              }}
            />
            OPEN BETA · SHIPPING WEEKLY · 2026-04
          </div>
        </section>

        {/* Ask */}
        <section style={{ marginBottom: 56 }}>
          <div
            className="font-pixel"
            style={{
              fontSize: 12,
              color: COLOR.FORGE,
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            ▸ WHAT I&apos;M LOOKING FOR
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {ASK.map((a) => (
              <div
                key={a.tag}
                style={{
                  padding: 24,
                  background: COLOR.PANEL,
                  border: `1px solid ${COLOR.FORGE}66`,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    color: COLOR.FORGE,
                    marginBottom: 8,
                    textShadow: `2px 2px 0 #000`,
                    lineHeight: 1,
                  }}
                >
                  {a.icon}
                </div>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 14,
                    color: COLOR.TEXT,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  {a.tag}
                </div>
                <div
                  className="font-retro"
                  style={{ fontSize: 18, color: COLOR.TEXT_MUTED, lineHeight: 1.4 }}
                >
                  {a.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact + CTA */}
        <section
          style={{
            padding: 32,
            background: COLOR.PANEL,
            border: `2px solid ${COLOR.FORGE}`,
            boxShadow: `0 0 40px ${COLOR.FORGE}33`,
          }}
        >
          <div
            className="font-pixel"
            style={{
              fontSize: 12,
              color: COLOR.FORGE,
              letterSpacing: 3,
              marginBottom: 20,
            }}
          >
            ▸ BOOK 15 MINUTES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <a
              href={CONTACT.cal}
              style={{
                display: "inline-block",
                padding: "18px 36px",
                background: COLOR.FORGE,
                color: "#000",
                textDecoration: "none",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: 16,
                letterSpacing: 3,
                border: `2px solid ${COLOR.FORGE_CREAM}`,
                boxShadow: `0 0 30px ${COLOR.FORGE}88`,
              }}
            >
              ▶ BOOK A CALL
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              style={{
                padding: "18px 32px",
                border: `2px solid ${COLOR.FORGE}66`,
                color: COLOR.TEXT,
                textDecoration: "none",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              ✉ {CONTACT.email}
            </a>
            <Link
              href={CONTACT.github}
              style={{
                padding: "18px 32px",
                border: `2px solid ${COLOR.BORDER}`,
                color: COLOR.TEXT_MUTED,
                textDecoration: "none",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              ★ GITHUB · alex-jb/vibex
            </Link>
          </div>
          <p
            className="font-retro"
            style={{
              fontSize: 16,
              color: COLOR.TEXT_MUTED,
              marginTop: 20,
              lineHeight: 1.4,
            }}
          >
            Source-available. Fully public. Full repo access on request.
            Monthly updates go out regardless — reply with{" "}
            <code style={{ color: COLOR.FORGE_CREAM }}>subscribe</code> if you want them.
          </p>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${COLOR.BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            className="font-pixel"
            style={{ fontSize: 10, color: COLOR.TEXT_DIM, letterSpacing: 2 }}
          >
            VIBEXFORGE.COM · alex-jb · built in public
          </div>
          <Link
            href="/"
            className="font-pixel"
            style={{
              fontSize: 10,
              color: COLOR.FORGE,
              letterSpacing: 2,
              textDecoration: "none",
            }}
          >
            ◀ back to main site
          </Link>
        </footer>
      </div>
    </main>
  );
}
