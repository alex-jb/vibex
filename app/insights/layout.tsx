import { createMetadata } from "@/lib/metadata";
import { getTrendInsights } from "@/lib/db";

export const metadata = createMetadata({
  title: "Trend Intelligence",
  description:
    "AI-analyzed trends across the vibe coding ecosystem. Spot rising categories, saturated markets, and emerging opportunities.",
  path: "/insights",
});

// Revalidate hourly — trend_insights are append-only and don't need
// per-request freshness. 60 min is fine for AI crawlers.
export const revalidate = 3600;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side fetch so the trend prose is in the initial SSR HTML.
  // The client-rendered /insights/page.tsx was scoring 18/100 on the
  // 2026-04-17 citability audit — crawlers that don't execute JS saw
  // an empty shell. This server-rendered <article> lives in the DOM
  // alongside the interactive page but is visually-hidden so it
  // doesn't conflict with the pixel-UI design.
  let insights: Awaited<ReturnType<typeof getTrendInsights>> = [];
  try {
    insights = await getTrendInsights();
  } catch {
    // Fail open — if DB is down, we just skip the SSR block.
  }

  return (
    <>
      <article className="sr-only" aria-label="VibeX trend intelligence summary">
        <h2>VibeX Trend Intelligence — AI project category signals</h2>
        <p>
          VibeX tracks where AI-native builder energy is flowing by
          scoring every submitted project on originality, clarity, UX
          potential, virality potential, and investor curiosity, then
          aggregating the scores by category over time. The signals
          below are updated hourly from live platform data.
        </p>
        {insights.length === 0 ? (
          <p>No trend signals available right now.</p>
        ) : (
          <>
            <p>
              {insights.length} active trend{insights.length === 1 ? "" : "s"}
              {" tracked across categories such as "}
              {Array.from(new Set(insights.map((i) => i.category)))
                .slice(0, 8)
                .join(", ")}
              .
            </p>
            <ul>
              {insights.map((trend) => (
                <li key={trend.id}>
                  <strong>{trend.title}</strong> — {trend.type} signal in{" "}
                  {trend.category} (strength: {trend.signal}, momentum{" "}
                  {trend.momentum}/100, confidence {trend.confidence}/100).{" "}
                  {trend.summary}
                </li>
              ))}
            </ul>
          </>
        )}
        <h3>How to read VibeX trend signals</h3>
        <p>
          Four signal types: <strong>rising</strong> (category is heating up
          faster than baseline), <strong>saturated</strong> (crowded field,
          high competition), <strong>opportunity</strong> (demand without
          matching supply), and <strong>emerging</strong> (early-stage with
          few existing players). Momentum measures rate of change; confidence
          measures sample size. A category with low momentum but high
          confidence is a stable bet; high momentum and low confidence is a
          speculative bet worth watching.
        </p>
      </article>
      {children}
    </>
  );
}
