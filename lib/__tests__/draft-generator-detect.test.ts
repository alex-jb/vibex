import { describe, it, expect } from "vitest";
import { detectStack } from "../draft-generator";

describe("detectStack", () => {
  it("returns null for missing url", () => {
    expect(detectStack(undefined)).toBeNull();
    expect(detectStack("")).toBeNull();
  });

  it("returns null for unknown host", () => {
    expect(detectStack("https://example.com")).toBeNull();
    expect(detectStack("https://github.com/foo/bar")).toBeNull();
  });

  it("returns null for invalid url", () => {
    expect(detectStack("not a url")).toBeNull();
  });

  it("detects lovable", () => {
    expect(detectStack("https://my-app.lovable.app")).toBe("lovable");
    expect(detectStack("https://lovable.app/projects/abc")).toBe("lovable");
    // Subdomain matters — root-only doesn't count
    expect(detectStack("https://lovable.app")).toBe("lovable");
  });

  it("detects v0", () => {
    expect(detectStack("https://my-component.v0.dev")).toBe("v0");
    expect(detectStack("https://v0.dev/chat/abc")).toBe("v0");
  });

  it("detects replit", () => {
    expect(detectStack("https://my-repl.replit.app")).toBe("replit");
    expect(detectStack("https://my-repl.alex.repl.co")).toBe("replit");
  });

  it("detects bolt", () => {
    expect(detectStack("https://bolt.new/my-project")).toBe("bolt");
    expect(detectStack("https://my-app.bolt.new")).toBe("bolt");
  });

  it("detects claude artifacts", () => {
    expect(
      detectStack("https://claude.ai/chat/abc/artifacts/def"),
    ).toBe("claude-artifacts");
    // Plain claude.ai chat (no /artifacts) is not an artifact
    expect(detectStack("https://claude.ai/chat/abc")).toBeNull();
  });

  it("is case-insensitive on host", () => {
    expect(detectStack("https://MY-APP.LOVABLE.APP")).toBe("lovable");
  });

  // touchdesigner is a desktop-app stack — no canonical hosted URL pattern,
  // so detectStack should NOT false-positive on common TD-creator demo hosts
  // like vimeo.com / instagram.com / youtube.com. Creators select it manually
  // at submit time, then STACK_HINT picks it up downstream.
  it("never auto-detects touchdesigner from URLs (manual-selection only)", () => {
    expect(detectStack("https://vimeo.com/123456789")).toBeNull();
    expect(detectStack("https://www.instagram.com/reel/abc/")).toBeNull();
    expect(detectStack("https://youtube.com/watch?v=xyz")).toBeNull();
    // Even if someone names a domain "touchdesigner.com", we don't try to detect
    expect(detectStack("https://touchdesigner.example.com")).toBeNull();
  });
});
