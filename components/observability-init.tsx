"use client";

/**
 * Observability bootstrap — mounts OpenPanel analytics + HyperDX error
 * monitoring in a single client boundary so app/layout.tsx stays clean.
 *
 * Both SDKs check their own env vars and no-op silently if unset. This
 * lets preview deploys (no analytics keys) skip instrumentation without
 * throwing. Production values live in Vercel env: NEXT_PUBLIC_OPENPANEL_CLIENT_ID
 * + NEXT_PUBLIC_HYPERDX_API_KEY.
 *
 * PH launch day (2026-05-01) this is the funnel + bug-triage layer.
 * OpenPanel: which submit/upvote/forge steps convert, where users drop.
 * HyperDX: session replay + error traces when someone reports a white screen.
 */

import { useEffect } from "react";
import { OpenPanelComponent } from "@openpanel/nextjs";

const OP_CLIENT_ID = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
const HYPERDX_KEY = process.env.NEXT_PUBLIC_HYPERDX_API_KEY;
const SERVICE_NAME = process.env.NEXT_PUBLIC_SERVICE_NAME || "vibexforge-web";

function HyperDXInit() {
  useEffect(() => {
    if (!HYPERDX_KEY) return;
    // Dynamic import so the SDK bundle only hits users who have the key
    // set — preview/local runs never download it.
    import("@hyperdx/browser").then(({ default: HyperDX }) => {
      HyperDX.init({
        apiKey: HYPERDX_KEY,
        service: SERVICE_NAME,
        tracePropagationTargets: [/vibexforge\.com/i, /supabase\.co/i],
        consoleCapture: true,
        advancedNetworkCapture: true,
      });
    });
  }, []);
  return null;
}

export function ObservabilityInit() {
  return (
    <>
      {OP_CLIENT_ID ? (
        <OpenPanelComponent
          clientId={OP_CLIENT_ID}
          trackScreenViews
          trackOutgoingLinks
        />
      ) : null}
      <HyperDXInit />
    </>
  );
}
