import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock next/server before importing api-response ───────────────────────────
//
// NextResponse.json() is a web-platform Response; we replace it with a simple
// stub that captures the body and status so we can assert on them in Node tests.

interface StubResponse {
  body: unknown;
  status: number;
}

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }): StubResponse => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

// Import AFTER mock is registered
const { apiSuccess, apiError } = await import("../api-response");

// ─── apiSuccess ───────────────────────────────────────────────────────────────

describe("apiSuccess", () => {
  it("returns status 200 by default", () => {
    const res = apiSuccess({ id: 1 }) as unknown as StubResponse;
    expect(res.status).toBe(200);
  });

  it("returns success: true in body", () => {
    const res = apiSuccess({ id: 1 }) as unknown as StubResponse;
    expect((res.body as { success: boolean }).success).toBe(true);
  });

  it("includes the data payload in body", () => {
    const data = { name: "test", value: 42 };
    const res = apiSuccess(data) as unknown as StubResponse;
    expect((res.body as { data: unknown }).data).toEqual(data);
  });

  it("allows custom status codes (e.g. 201 Created)", () => {
    const res = apiSuccess({ created: true }, 201) as unknown as StubResponse;
    expect(res.status).toBe(201);
  });

  it("handles null data without throwing", () => {
    expect(() => apiSuccess(null)).not.toThrow();
    const res = apiSuccess(null) as unknown as StubResponse;
    expect((res.body as { data: unknown }).data).toBeNull();
  });

  it("handles array data", () => {
    const data = [1, 2, 3];
    const res = apiSuccess(data) as unknown as StubResponse;
    expect((res.body as { data: unknown }).data).toEqual(data);
  });

  it("handles empty object data", () => {
    const res = apiSuccess({}) as unknown as StubResponse;
    expect((res.body as { data: unknown }).data).toEqual({});
  });

  it("handles undefined data", () => {
    expect(() => apiSuccess(undefined)).not.toThrow();
  });

  it("handles deeply nested data structures", () => {
    const data = { a: { b: { c: { d: [1, 2, 3] } } } };
    const res = apiSuccess(data) as unknown as StubResponse;
    expect((res.body as { data: typeof data }).data).toEqual(data);
  });

  it("handles string data", () => {
    const res = apiSuccess("ok") as unknown as StubResponse;
    expect((res.body as { data: unknown }).data).toBe("ok");
  });

  it("body does not contain an error field on success", () => {
    const res = apiSuccess({ x: 1 }) as unknown as StubResponse;
    expect((res.body as Record<string, unknown>).error).toBeUndefined();
  });
});

// ─── apiError ─────────────────────────────────────────────────────────────────

describe("apiError", () => {
  it("returns status 400 by default", () => {
    const res = apiError("Bad request") as unknown as StubResponse;
    expect(res.status).toBe(400);
  });

  it("returns success: false in body", () => {
    const res = apiError("Oops") as unknown as StubResponse;
    expect((res.body as { success: boolean }).success).toBe(false);
  });

  it("includes the error message in body", () => {
    const res = apiError("Not found") as unknown as StubResponse;
    const error = (res.body as { error: { message: string } }).error;
    expect(error.message).toBe("Not found");
  });

  it("includes the status code in the error object", () => {
    const res = apiError("Unauthorized", 401) as unknown as StubResponse;
    const error = (res.body as { error: { code: number } }).error;
    expect(error.code).toBe(401);
  });

  it("allows custom status codes (e.g. 404, 500)", () => {
    const res404 = apiError("Not Found", 404) as unknown as StubResponse;
    const res500 = apiError("Server Error", 500) as unknown as StubResponse;
    expect(res404.status).toBe(404);
    expect(res500.status).toBe(500);
  });

  it("includes errorId in error object when provided", () => {
    const res = apiError("Conflict", 409, "ERR_123") as unknown as StubResponse;
    const error = (res.body as { error: { errorId?: string } }).error;
    expect(error.errorId).toBe("ERR_123");
  });

  it("omits errorId when not provided", () => {
    const res = apiError("Bad request") as unknown as StubResponse;
    const error = (res.body as { error: Record<string, unknown> }).error;
    expect(error.errorId).toBeUndefined();
  });

  it("handles empty string message", () => {
    expect(() => apiError("")).not.toThrow();
    const res = apiError("") as unknown as StubResponse;
    expect((res.body as { error: { message: string } }).error.message).toBe("");
  });

  it("handles long error messages", () => {
    const longMsg = "x".repeat(2000);
    const res = apiError(longMsg) as unknown as StubResponse;
    expect((res.body as { error: { message: string } }).error.message).toBe(longMsg);
  });

  it("handles special characters in error message", () => {
    const msg = '<script>alert("xss")</script>';
    const res = apiError(msg) as unknown as StubResponse;
    expect((res.body as { error: { message: string } }).error.message).toBe(msg);
  });

  it("body does not contain a data field on error", () => {
    const res = apiError("fail") as unknown as StubResponse;
    expect((res.body as Record<string, unknown>).data).toBeUndefined();
  });
});

// ─── Structural shape verification ───────────────────────────────────────────

describe("response envelope shape", () => {
  it("apiSuccess body has exactly { success, data } keys", () => {
    const res = apiSuccess({ x: 1 }) as unknown as StubResponse;
    const keys = Object.keys(res.body as object).sort();
    expect(keys).toEqual(["data", "success"]);
  });

  it("apiError body has exactly { success, error } keys", () => {
    const res = apiError("Bad") as unknown as StubResponse;
    const keys = Object.keys(res.body as object).sort();
    expect(keys).toEqual(["error", "success"]);
  });

  it("apiError error object has at least { message, code } keys", () => {
    const res = apiError("test", 422) as unknown as StubResponse;
    const error = (res.body as { error: Record<string, unknown> }).error;
    expect(error).toHaveProperty("message");
    expect(error).toHaveProperty("code");
  });
});
