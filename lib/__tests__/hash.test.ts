import { describe, it, expect } from "vitest";
import { hashString } from "@/lib/hash";

describe("hashString", () => {
  it("returns 0 for empty string", () => {
    expect(hashString("")).toBe(0);
  });

  it("is deterministic across calls", () => {
    expect(hashString("project-abc")).toBe(hashString("project-abc"));
  });

  it("differs for different inputs", () => {
    expect(hashString("a")).not.toBe(hashString("b"));
  });

  it("produces a 32-bit signed integer", () => {
    const h = hashString("long-project-id-1234567890abcdef");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(-(2 ** 31));
    expect(h).toBeLessThan(2 ** 31);
  });

  it("handles unicode without throwing", () => {
    expect(() => hashString("项目-🚀-αβγ")).not.toThrow();
    expect(typeof hashString("项目-🚀-αβγ")).toBe("number");
  });

  it("related-shuffle ordering is stable across calls (regression guard)", () => {
    // This is the actual usage pattern from app/project/[id]/page.tsx —
    // seeded shuffle of related project ids. Must produce the SAME
    // ordering on every call (otherwise SSR ↔ CSR would mismatch).
    const seed = hashString("project-A");
    const ids = ["p1", "p2", "p3", "p4", "p5"];
    const order = (s: number) =>
      ids
        .map((i) => ({ i, k: hashString(i) ^ s }))
        .sort((x, y) => x.k - y.k)
        .map((x) => x.i);
    expect(order(seed)).toEqual(order(seed));
  });

  it("different seeds produce different orderings (most of the time)", () => {
    const ids = ["p1", "p2", "p3", "p4", "p5"];
    const order = (s: number) =>
      ids
        .map((i) => ({ i, k: hashString(i) ^ s }))
        .sort((x, y) => x.k - y.k)
        .map((x) => x.i)
        .join(",");
    // Two different seeds → almost always different sort order. If they
    // ARE the same that's a bug (no shuffle happening) or a hash collision
    // (very unlikely with djb2 over short strings).
    const orderingA = order(hashString("project-A"));
    const orderingB = order(hashString("project-Z"));
    expect(orderingA).not.toBe(orderingB);
  });
});
