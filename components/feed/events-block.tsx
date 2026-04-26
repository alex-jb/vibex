"use client";

/* ═══════════════════════════════════════════════════════════════════════════
   EventsBlock — small "what's coming up" rail card under TrendingSidebar on
   /feed (lg+ desktop only). Three dated event cards reinforce that the
   platform is actively shipping. Codedex pattern (referenced 2026-04-25):
   community pages feel alive when there's a visible roadmap of upcoming
   things, not just historical posts.

   Events are hardcoded for the PH launch window (5/1 launch day, then
   weekly Forge Friday + winner showcase). Past events drop off
   automatically. When all three events are past, the whole block hides
   so the rail doesn't show a dead "history" view post-launch.
   ═══════════════════════════════════════════════════════════════════════════ */

interface EventItem {
  /** ISO date — used for ordering + automatic past-event filtering. */
  iso: string;
  /** Short label (e.g., "MAY 1") rendered in the date pill. */
  dateLabel: string;
  title: string;
  blurb: string;
  href?: string;
}

const EVENTS: EventItem[] = [
  {
    iso: "2026-05-01",
    dateLabel: "MAY 1",
    title: "PRODUCT HUNT LAUNCH",
    blurb: "Day-1 forge ceremony. Be there at PST 12:01 AM.",
    href: "/launch",
  },
  {
    iso: "2026-05-08",
    dateLabel: "MAY 8",
    title: "FORGE FRIDAY",
    blurb: "Weekly demo call — 3 creators show what they shipped.",
  },
  {
    iso: "2026-05-15",
    dateLabel: "MAY 15",
    title: "WEEK 1 WINNER",
    blurb: "Top hero by real traction gets a Legendary stamp.",
  },
];

export function EventsBlock() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const upcoming = EVENTS.filter((e) => new Date(e.iso) >= today);
  if (upcoming.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="font-pixel"
        style={{
          fontSize: 8,
          letterSpacing: 2,
          color: "var(--text-muted)",
          marginBottom: 8,
          paddingLeft: 2,
        }}
      >
        ▸ COMING UP
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {upcoming.map((e) => {
          const Card = (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "8px 10px",
                background: "var(--bg-panel)",
                border: "1px solid rgba(255,69,0,0.25)",
                boxShadow: "2px 2px 0 #000",
              }}
            >
              <div
                aria-hidden
                className="font-pixel"
                style={{
                  fontSize: 8,
                  color: "#FFE27D",
                  background: "#1A0F00",
                  border: "1px solid #FF4500",
                  padding: "4px 4px 3px",
                  letterSpacing: 1,
                  alignSelf: "flex-start",
                  whiteSpace: "nowrap",
                }}
              >
                {e.dateLabel}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 8,
                    color: "var(--neon-orange)",
                    letterSpacing: 1,
                    marginBottom: 3,
                    lineHeight: 1.25,
                  }}
                >
                  {e.title}
                </div>
                <div
                  className="font-retro"
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {e.blurb}
                </div>
              </div>
            </div>
          );
          return e.href ? (
            <a
              key={e.iso}
              href={e.href}
              className="block transition-transform hover:scale-[1.02]"
              style={{ textDecoration: "none" }}
            >
              {Card}
            </a>
          ) : (
            <div key={e.iso}>{Card}</div>
          );
        })}
      </div>
    </div>
  );
}
