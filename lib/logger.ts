/**
 * Structured server-side logger.
 *
 * - Development: logs errorId, message, AND full error object.
 * - Production:  logs errorId + message, reports to Sentry.
 */

const isDev = process.env.NODE_ENV !== "production";

let _sentryModule: typeof import("@sentry/nextjs") | null = null;
let _sentryLoaded = false;

async function loadSentry() {
  if (_sentryLoaded) return _sentryModule;
  _sentryLoaded = true;
  try {
    _sentryModule = await import("@sentry/nextjs");
  } catch {
    _sentryModule = null;
  }
  return _sentryModule;
}

function getSentry() {
  if (!_sentryLoaded) {
    loadSentry();
  }
  return _sentryModule;
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
