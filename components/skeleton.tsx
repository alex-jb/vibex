/**
 * <Skeleton /> — uniform loading placeholder.
 *
 * Replaces the inconsistent "Loading..." text + spinner + blank-state
 * mix across the app. One animation, one color, one corner radius.
 *
 * Use:
 *   <Skeleton className="h-4 w-32" />
 *   <SkeletonCard />     // card-shaped placeholder
 *   <SkeletonRow />      // list-row placeholder
 *
 * Animation: 1.5s shimmer pulse, prefers-reduced-motion respected
 * via the @media block in globals.css.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/[0.04] rounded-md animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${className}`}
      style={{ borderColor: "var(--border-soft)" }}
      aria-hidden
    >
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-12 mt-2" />
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border p-4 flex items-center gap-3 ${className}`}
      style={{ borderColor: "var(--border-soft)" }}
      aria-hidden
    >
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonStatTile() {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: "var(--border-soft)" }}
      aria-hidden
    >
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}
