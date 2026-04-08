"use client";

import type { ReactNode } from "react";

interface WaterfallGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive waterfall (masonry) layout using CSS columns.
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 *
 * Each child gets `break-inside: avoid` to prevent splitting across columns.
 */
export function WaterfallGrid({ children, className = "" }: WaterfallGridProps) {
  return (
    <div
      className={`columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:break-inside-avoid [&>*]:mb-6 ${className}`}
    >
      {children}
    </div>
  );
}
