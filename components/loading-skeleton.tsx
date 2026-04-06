"use client";

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/5">
      <div className="h-44 animate-pulse bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-white/5" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/5 p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-white/5" />
        <div className="h-4 w-96 animate-pulse rounded bg-white/5" />
      </div>

      {/* Grid of card skeletons */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
