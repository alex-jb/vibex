import Link from "next/link";

const C = {
  BG: "#0D0D0D",
  PANEL: "#111114",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
  PURPLE: "#9D00FF",
  PURPLE_TEXT: "#C077FF",
};

export default function ContactPage() {
  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${C.FORGE}22, transparent 70%)` }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {[
          { top: 0, left: 0, borderTop: `3px solid ${C.FORGE}`, borderLeft: `3px solid ${C.FORGE}` },
          { top: 0, right: 0, borderTop: `3px solid ${C.FORGE}`, borderRight: `3px solid ${C.FORGE}` },
          { bottom: 0, left: 0, borderBottom: `3px solid ${C.FORGE}`, borderLeft: `3px solid ${C.FORGE}` },
          { bottom: 0, right: 0, borderBottom: `3px solid ${C.FORGE}`, borderRight: `3px solid ${C.FORGE}` },
        ].map((s, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: 24, height: 24, ...s }}
          />
        ))}

        <div
          style={{
            background: C.PANEL,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${C.BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF5F57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FEBC2E", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#28C840", display: "inline-block" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}>
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://CONTACT
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

        <div
          style={{
            background: C.PANEL,
            padding: "32px 28px",
            border: `1px solid ${C.BORDER}`,
            borderTop: "none",
          }}
        >
          <h1
            className="font-pixel"
            style={{
              fontSize: 20,
              color: C.CREAM,
              letterSpacing: 3,
              marginBottom: 8,
              textShadow: `2px 2px 0 #000, 0 0 12px ${C.FORGE}44`,
            }}
          >
            Contact
          </h1>
          <div className="font-pixel" style={{ fontSize: 9, color: C.FORGE, letterSpacing: 3, marginBottom: 28 }}>
            ▸ REACH THE FORGE
          </div>

          <div
            aria-hidden="true"
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
          >
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
            <span style={{ fontSize: 14, color: C.FORGE }}>◉</span>
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
          </div>

          <p className="font-retro" style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
            VibeXForge is built by <strong style={{ color: C.CREAM }}>@alex-jb</strong>, a solo founder. The fastest ways to reach the project:
          </p>

          {/* Channel cards */}
          <div style={{ display: "grid", gap: 14, marginBottom: 32 }}>
            <Link
              href="https://github.com/alex-jb/vibex/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "18px 20px",
                border: `2px solid ${C.GREEN}66`,
                background: `${C.GREEN}0A`,
                textDecoration: "none",
                transition: "all 200ms",
              }}
            >
              <div className="font-pixel" style={{ fontSize: 11, color: C.GREEN, letterSpacing: 3, marginBottom: 8 }}>
                ▸ GITHUB ISSUES
              </div>
              <div className="font-retro" style={{ fontSize: 17, color: C.TEXT, marginBottom: 4 }}>
                github.com/alex-jb/vibex/issues
              </div>
              <div className="font-retro" style={{ fontSize: 15, color: C.DIM }}>
                Bugs · feature requests · launch questions
              </div>
            </Link>

            <div
              style={{
                padding: "18px 20px",
                border: `2px solid ${C.FORGE}66`,
                background: `${C.FORGE}0A`,
              }}
            >
              <div className="font-pixel" style={{ fontSize: 11, color: C.FORGE, letterSpacing: 3, marginBottom: 8 }}>
                ✉ EMAIL
              </div>
              <div className="font-retro" style={{ fontSize: 17, color: C.TEXT, marginBottom: 4 }}>
                alex@vibexforge.com
              </div>
              <div className="font-retro" style={{ fontSize: 15, color: C.DIM }}>
                Press · partnerships · business
              </div>
            </div>
          </div>

          {/* DISAMBIGUATION accent block */}
          <div
            style={{
              marginBottom: 28,
              padding: "16px 18px",
              border: `2px solid ${C.PURPLE}`,
              background: `${C.PURPLE}0F`,
              boxShadow: `0 0 16px ${C.PURPLE}22`,
            }}
          >
            <div
              className="font-pixel"
              style={{ fontSize: 10, color: C.PURPLE_TEXT, letterSpacing: 3, marginBottom: 10 }}
            >
              ◆ DISAMBIGUATION
            </div>
            <p className="font-retro" style={{ color: C.TEXT, fontSize: 17, lineHeight: 1.65 }}>
              &ldquo;VibeX&rdquo; is a common name. This site (
              <strong style={{ color: C.CREAM }}>vibexforge.com</strong>) is not affiliated with{" "}
              <code style={{ color: C.PURPLE_TEXT }}>tiwater/vibex</code>,{" "}
              <code style={{ color: C.PURPLE_TEXT }}>dustland/vibex</code>,{" "}
              <code style={{ color: C.PURPLE_TEXT }}>sethdford/vibex-*</code>, or any company named &ldquo;VibeX Ventures.&rdquo; Our canonical GitHub repo is{" "}
              <Link
                href="https://github.com/alex-jb/vibex"
                style={{ color: C.GREEN, textDecoration: "underline" }}
                target="_blank"
                rel="noopener"
              >
                alex-jb/vibex
              </Link>
              .
            </p>
          </div>

          <h2 className="font-pixel" style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}>
            ⬢ Response time
          </h2>
          <p className="font-retro" style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
            Issues and email are read within 48 hours during weekdays. VibeXForge is a solo project, so critical bugs ship faster than polite pings. If something is broken, open an issue with repro steps and it gets priority.
          </p>

          <div
            style={{
              marginTop: 40,
              padding: "12px 16px",
              borderTop: `1px dashed ${C.BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 6,
                height: 6,
                background: C.GREEN,
                boxShadow: `0 0 6px ${C.GREEN}`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span className="font-pixel" style={{ fontSize: 8, color: C.DIM, letterSpacing: 3 }}>
              Solo founder · built with Claude Code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
