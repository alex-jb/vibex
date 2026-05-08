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
          <span
            className="font-pixel mb-2 inline-block px-3 py-1 text-[10px] tracking-widest"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.35)",
              color: "#F97316",
            }}
          >
            {badge}
          </span>
        )}
        <h2
          className="font-pixel text-[18px] sm:text-[22px]"
          style={{
            letterSpacing: 2,
            lineHeight: 1.3,
            color: "#FFFCEB",
            textShadow: "2px 2px 0 #000",
          }}
        >
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
