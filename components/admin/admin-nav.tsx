import Link from "next/link";

/**
 * Top nav strip for /admin/* pages. Hand-curated list of admin surfaces
 * so Alex doesn't have to remember URLs. Order: most-frequently checked
 * first (metrics → leaderboard → moderation → waitlist).
 */
export function AdminNav({ current }: { current?: string }) {
  const links = [
    { href: "/admin/metrics", label: "📊 Metrics", emoji: "" },
    { href: "/admin/score-leaderboard", label: "🏆 Leaderboard", emoji: "" },
    { href: "/admin", label: "🛡 Moderation", emoji: "" },
    { href: "/admin/cracked-waitlist", label: "🧠 Cracked", emoji: "" },
    { href: "/admin/analytics", label: "📈 Analytics", emoji: "" },
  ];
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-center gap-2 border-b border-zinc-800 pb-4 text-xs">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-full px-3 py-1.5 ring-1 ${
            current === l.href
              ? "bg-orange-500 text-black ring-orange-500"
              : "text-zinc-400 ring-zinc-700 hover:text-zinc-200 hover:ring-zinc-500"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
