/**
 * <EmptyState /> — shared illustrated empty states.
 *
 * Picks an SVG glyph by `kind`, pairs with a heading + description +
 * optional CTA. Replaces the plain dashed-border placeholders that
 * were on /dashboard, /drafts, /notifications, /try, /analytics —
 * those felt "unfinished", this feels "intentionally calm".
 *
 * Glyphs are inline SVGs so there's no HTTP fetch + they color-shift
 * to follow the surface accent. Pattern lifted from Linear / Vercel
 * empty states (subtle gradient ring + pictogram center).
 */

import Link from "next/link";
import type { ReactNode } from "react";

type EmptyKind =
  | "drafts"        // no drafts on /project/[id]/drafts
  | "projects"      // no projects on /dashboard
  | "engagement"    // no engagement yet on /analytics
  | "notifications" // no notifications on /notifications
  | "filter"        // filter empty (used inside other lists)
  | "general";

const GLYPHS: Record<EmptyKind, ReactNode> = {
  drafts: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.15" />
      <rect x="24" y="20" width="32" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="30" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="38" x2="46" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  projects: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.15" />
      <path d="M 22 50 L 22 28 L 38 28 L 42 32 L 58 32 L 58 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  engagement: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.15" />
      <polyline
        points="20,52 28,40 36,46 44,32 52,38 60,24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="24" r="3" fill="currentColor" />
    </>
  ),
  notifications: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.15" />
      <path
        d="M 32 26 Q 32 22 36 22 L 44 22 Q 48 22 48 26 L 48 38 L 52 44 L 28 44 L 32 38 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="36" y1="48" x2="44" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  filter: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.1" />
      <path
        d="M 26 28 L 54 28 L 44 38 L 44 52 L 36 48 L 36 38 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </>
  ),
  general: (
    <>
      <circle cx="40" cy="40" r="32" fill="url(#g)" opacity="0.15" />
      <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="32" y1="40" x2="48" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

export function EmptyState({
  kind = "general",
  title,
  description,
  ctaLabel,
  ctaHref,
  accent = "violet",
}: {
  kind?: EmptyKind;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  accent?: "violet" | "emerald" | "forge" | "amber";
}) {
  const accentColor = {
    violet: "var(--brand-violet)",
    emerald: "var(--brand-emerald)",
    forge: "var(--brand-forge)",
    amber: "var(--brand-amber)",
  }[accent];

  return (
    <div className="rounded-xl border bg-white/[0.015] px-6 py-12 text-center"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <svg
        viewBox="0 0 80 80"
        width="80"
        height="80"
        className="mx-auto mb-5"
        style={{ color: accentColor }}
        aria-hidden
      >
        <defs>
          <radialGradient id="g">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        {GLYPHS[kind]}
      </svg>
      <h3 className="text-foreground/90 font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-foreground/55 text-sm max-w-md mx-auto mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
