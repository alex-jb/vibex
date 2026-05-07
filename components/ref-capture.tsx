"use client";

import { useEffect } from "react";

/**
 * Captures `?ref=hn` / `?ref=ph` / `?ref=tw` etc from the current URL
 * and stores it in a cookie so the server can read it at signup time.
 *
 * Why a cookie not localStorage: getOrCreateCreator runs server-side
 * and needs to read the value at first project submit, which can be
 * days after the user first landed. localStorage is client-only.
 *
 * Cookie name: vibex_ref. SameSite=Lax + Secure + 30-day expiry.
 * First-write-wins: if a user lands from HN, then later clicks a PH
 * link, we keep HN as the original referrer. Distribution attribution
 * is "what brought you here first," not "what brought you back."
 *
 * Whitelist of allowed values prevents the URL bar from being used
 * to inject arbitrary strings into our analytics. Anything not on
 * the whitelist gets stored as 'unknown'.
 */
const ALLOWED_REFS = new Set([
  "hn",         // Hacker News (Show HN, etc.)
  "ph",         // Product Hunt
  "tw",         // Twitter/X
  "reddit",     // any subreddit
  "linkedin",
  "dev_to",
  "bsky",       // Bluesky
  "threads",    // Meta Threads
  "direct",     // explicitly direct
  "newsletter",
  "discord",
]);

const COOKIE_NAME = "vibex_ref";
const COOKIE_MAX_AGE_DAYS = 30;

export function RefCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    // First-write-wins: don't overwrite an earlier ref. We want the
    // attribution to credit the original channel that introduced
    // the user, not the last link they clicked.
    const existing = readCookie(COOKIE_NAME);
    if (existing) return;

    const normalized = ALLOWED_REFS.has(ref) ? ref : "unknown";

    // 30-day cookie. SameSite=Lax permits the cookie on top-level
    // navigations from external domains (which is exactly the case
    // we're trying to track — clicking a link from HN/PH/etc).
    const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(normalized)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  }, []);

  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
