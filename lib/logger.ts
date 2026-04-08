/**
 * Minimal server-side logger.
 *
 * - Development: logs errorId, message, AND full error object.
 * - Production:  logs errorId + message only (no error object leak).
 */

const isDev = process.env.NODE_ENV !== "production";

export const serverLog = {
  error(errorId: string, message: string, error: unknown): void {
    if (isDev) {
      console.error(`[${errorId}] ${message}:`, error);
    } else {
      console.error(`[${errorId}] ${message}`);
    }
  },
} as const;
