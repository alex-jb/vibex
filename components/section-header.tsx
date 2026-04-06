import type { ReactNode } from "react";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  badge,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge && (
          <span className="mb-2 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
