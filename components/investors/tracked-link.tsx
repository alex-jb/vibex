"use client";

import type { CSSProperties, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Anchor that emits a PostHog event on click, then lets the native
 * navigation / mailto / external-link behavior proceed normally.
 *
 * Event name convention: pass an `event` like "investor_cta_book" /
 * "investor_cta_email" / "investor_cta_github" / "investor_zh_video".
 * Properties include the destination URL + `from` page identifier.
 */
export function TrackedLink({
  href,
  event,
  properties,
  children,
  style,
  className,
  target,
  rel,
}: {
  href: string;
  event: string;
  properties?: Record<string, unknown>;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={() => {
        trackEvent(event, { href, from: "/investors", ...properties });
      }}
      style={style}
      className={className}
    >
      {children}
    </a>
  );
}
