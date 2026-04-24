/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent, identifyUser, resetUser } from "@/lib/analytics";

describe("lib/analytics (OpenPanel adapter)", () => {
  let op: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    op = vi.fn();
    // Simulate OpenPanelComponent having injected the CDN script
    (window as unknown as { op: typeof op }).op = op;
  });

  afterEach(() => {
    delete (window as unknown as { op?: unknown }).op;
  });

  it("trackEvent forwards name + props to window.op('track', ...)", () => {
    trackEvent("investor_video_played", { duration: 140 });
    expect(op).toHaveBeenCalledWith("track", "investor_video_played", {
      duration: 140,
    });
  });

  it("trackEvent no-ops when window.op is absent", () => {
    delete (window as unknown as { op?: unknown }).op;
    expect(() => trackEvent("anything")).not.toThrow();
  });

  it("identifyUser packages profileId into the identify payload", () => {
    identifyUser("user_123", { plan: "free" });
    expect(op).toHaveBeenCalledWith("identify", {
      profileId: "user_123",
      plan: "free",
    });
  });

  it("resetUser calls window.op('clear')", () => {
    resetUser();
    expect(op).toHaveBeenCalledWith("clear");
  });
});
