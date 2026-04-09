import { test, expect } from "@playwright/test";

test.describe("Share Card API", () => {
  test("share card API returns PNG for valid project", async ({ request }) => {
    const response = await request.get("/api/share/card?id=1&size=square");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("share card API returns wide format", async ({ request }) => {
    const response = await request.get("/api/share/card?id=1&size=wide");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("share card API returns 400 for missing id", async ({ request }) => {
    const response = await request.get("/api/share/card");
    expect(response.status()).toBe(400);
  });

  test("share card API returns 404 for invalid project", async ({ request }) => {
    const response = await request.get("/api/share/card?id=nonexistent");
    expect(response.status()).toBe(404);
  });

  test("data API returns projects", async ({ request }) => {
    const response = await request.get("/api/data/projects");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("data API returns 404 for unknown entity", async ({ request }) => {
    const response = await request.get("/api/data/foobar");
    expect(response.status()).toBe(404);
  });
});
