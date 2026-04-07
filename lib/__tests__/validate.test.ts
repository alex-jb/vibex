import { describe, it, expect } from "vitest";
import { validateString, validateEnum, sanitize } from "../validate";

describe("validateString", () => {
  it("returns error for empty required field", () => {
    expect(validateString("", "name")).not.toBeNull();
  });

  it("returns null for valid string", () => {
    expect(validateString("hello", "name")).toBeNull();
  });

  it("returns error when too short", () => {
    expect(validateString("ab", "name", { min: 3 })).not.toBeNull();
  });

  it("returns error when too long", () => {
    expect(validateString("a".repeat(201), "name", { max: 200 })).not.toBeNull();
  });

  it("returns null for optional empty field", () => {
    expect(validateString("", "name", { required: false })).toBeNull();
  });

  it("returns error for non-string value", () => {
    expect(validateString(123 as unknown, "name")).not.toBeNull();
  });
});

describe("validateEnum", () => {
  it("returns null for valid enum value", () => {
    expect(validateEnum("a", "field", ["a", "b", "c"])).toBeNull();
  });

  it("returns error for invalid enum value", () => {
    expect(validateEnum("x", "field", ["a", "b", "c"])).not.toBeNull();
  });
});

describe("sanitize", () => {
  it("escapes HTML characters", () => {
    expect(sanitize("<script>alert('xss')</script>")).not.toContain("<script>");
  });

  it("escapes angle brackets", () => {
    const result = sanitize("<div>test</div>");
    expect(result).toBe("&lt;div&gt;test&lt;/div&gt;");
  });

  it("escapes quotes", () => {
    const result = sanitize('He said "hello"');
    expect(result).toBe("He said &quot;hello&quot;");
  });

  it("escapes ampersands", () => {
    const result = sanitize("A & B");
    expect(result).toBe("A &amp; B");
  });
});
