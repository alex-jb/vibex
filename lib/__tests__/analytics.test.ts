/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock posthog-js BEFORE importing the module under test
vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("lib/analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("trackEvent is a no-op when NEXT_PUBLIC_POSTHOG_KEY is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { trackEvent } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    trackEvent("test_event");
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("trackEvent calls posthog.init exactly once across multiple calls", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    const { trackEvent } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    trackEvent("a");
    trackEvent("b");
    trackEvent("c");
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledTimes(3);
  });

  it("trackEvent passes name + properties through to posthog.capture", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    const { trackEvent } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    trackEvent("investor_video_played", { duration: 140, current: 0 });
    expect(posthog.capture).toHaveBeenCalledWith("investor_video_played", {
      duration: 140,
      current: 0,
    });
  });

  it("identifyUser calls posthog.identify when initialized", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    const { trackEvent, identifyUser } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    trackEvent("init"); // trigger init
    identifyUser("user_123", { plan: "free" });
    expect(posthog.identify).toHaveBeenCalledWith("user_123", { plan: "free" });
  });

  it("resetUser is a no-op before init", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { resetUser } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    resetUser();
    expect(posthog.reset).not.toHaveBeenCalled();
  });

  it("resetUser calls posthog.reset after init", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    const { trackEvent, resetUser } = await import("@/lib/analytics");
    const { default: posthog } = await import("posthog-js");
    trackEvent("init"); // trigger init
    resetUser();
    expect(posthog.reset).toHaveBeenCalledTimes(1);
  });
});
