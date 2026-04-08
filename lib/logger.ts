/**
 * Structured server-side logger.
 *
 * - Development: logs errorId, message, AND full error object.
 * - Production:  logs errorId + message, reports to Sentry.
 */

const isDev = process.env.NODE_ENV !== "production";

function getSentry() {
  try {
    // Dynamic import to avoid build errors if Sentry is not configured
    return require("@sentry/nextjs") as typeof import("@sentry/nextjs");
  } catch {
    return null;
  }
}

export const serverLog = {
  error(errorId: string, message: string, error: unknown): void {
    if (isDev) {
      console.error(`[${errorId}] ${message}:`, error);
    } else {
      console.error(`[${errorId}] ${message}`);
      const sentry = getSentry();
      if (sentry) {
        if (error instanceof Error) {
          sentry.captureException(error, { extra: { errorId, message } });
        } else {
          sentry.captureMessage(`[${errorId}] ${message}`, {
            level: "error",
            extra: { errorId, error },
          });
        }
      }
    }
  },

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context ?? "");
    if (!isDev) {
      const sentry = getSentry();
      sentry?.addBreadcrumb({ message, level: "warning", data: context });
    }
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, context ?? "");
    }
    const sentry = getSentry();
    sentry?.addBreadcrumb({ message, level: "info", data: context });
  },
} as const;
