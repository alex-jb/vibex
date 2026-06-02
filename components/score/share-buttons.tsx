"use client";

import { useState } from "react";

/**
 * <ScoreShareButtons> — share UX for /score/[handle].
 *
 * Two buttons side-by-side:
 *   1. "Share on X" — opens twitter intent with text + url
 *   2. "Copy tweet" — copies the same text+url to clipboard (clipboard API)
 *
 * Why both: some users want the prefilled tweet box (X intent), others
 * want the raw text to paste into their own posting app (Buffer, Hypefury,
 * 小红书 etc). Copy button covers the second case.
 *
 * Composes a 280-char X-friendly message:
 *   "I'm Bronze 🥉 on VibeXForge — 65 pts across 4 surfaces.
 *    Idea → Validate → Funeral → Revive. Card: vibexforge.com/score/alex"
 */
interface Props {
  handle: string;
  score: number;
  tierLabel: string;
  tierEmoji: string;
  funerals: number;
  ideaFunerals: number;
  validations: number;
  launchkits: number;
  revivals: number;
  ships: number;
}

export function ScoreShareButtons(props: Props) {
  const [copied, setCopied] = useState(false);

  const url = `https://vibexforge.com/score/${props.handle}`;
  const totalActions =
    props.funerals + props.ideaFunerals + props.validations + props.launchkits + props.revivals + props.ships;

  const tweetText =
    `I'm ${props.tierLabel} ${props.tierEmoji} on VibeXForge — ${props.score} pts across ${totalActions} actions.\n\n` +
    `Validate → Launch → Bury → Revive → Ship. The full creator lifecycle in one number.\n\n` +
    `${url}`;

  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can fail on insecure contexts — surface fallback prompt
      const ta = document.createElement("textarea");
      ta.value = tweetText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert(tweetText);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <a
        href={xIntent}
        target="_blank"
        rel="noreferrer"
        className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-orange-400"
      >
        Share on X
      </a>
      <button
        type="button"
        onClick={copy}
        className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-center text-sm font-semibold text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-700"
      >
        {copied ? "✓ Copied" : "Copy tweet"}
      </button>
    </div>
  );
}
