import { test, expect } from "@playwright/test";

test.describe("Project Detail Page", () => {
  test("loads project detail for valid ID", async ({ page }) => {
    await page.goto("/project/1");
    await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
    // Should show project title
    await expect(page.locator("text=VibeTranslate")).toBeVisible();
  });

  test("shows 404 for invalid project ID", async ({ page }) => {
    await page.goto("/project/nonexistent-id-999");
    await expect(page.locator("text=未找到")).toBeVisible({ timeout: 5000 });
  });

  test("has playable demo component", async ({ page }) => {
    await page.goto("/project/1");
    // Demo component should be present
    await expect(page.locator("text=Live")).toBeVisible({ timeout: 5000 });
  });

  test("has AI review panel", async ({ page }) => {
    await page.goto("/project/1");
    await expect(page.locator("text=AI")).toBeVisible({ timeout: 5000 });
  });

  test("has comment section", async ({ page }) => {
    await page.goto("/project/1");
    // Comment section should exist
    const comments = page.locator("text=评论");
    await expect(comments.first()).toBeVisible({ timeout: 5000 });
  });

  test("back to explore link works", async ({ page }) => {
    await page.goto("/project/1");
    const backLink = page.locator("text=返回探索").first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL("/explore");
    }
  });
});
