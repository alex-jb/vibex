"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="max-w-md rounded-xl border border-white/10 bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
            !
          </div>
          <h2 className="mb-2 text-xl font-bold">Critical Error</h2>
          <p className="mb-6 text-sm text-gray-400">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
