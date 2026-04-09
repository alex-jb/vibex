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

  test("has semantic article element with schema.org", async ({ page }) => {
    await page.goto("/project/1");
    const article = page.locator("article[itemscope]");
    await expect(article).toBeVisible({ timeout: 5000 });
  });

  test("has breadcrumb navigation", async ({ page }) => {
    await page.goto("/project/1");
    await expect(page.locator("nav[aria-label='Breadcrumb']")).toBeVisible({ timeout: 5000 });
  });

  test("has time element with datetime attribute", async ({ page }) => {
    await page.goto("/project/1");
    const timeEl = page.locator("time[datetime]");
    await expect(timeEl.first()).toBeVisible({ timeout: 5000 });
  });

  test("share modal opens with card preview", async ({ page }) => {
    await page.goto("/project/1");
    await page.getByRole("button", { name: /share/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("text=Share Card").first()).toBeVisible();
    await expect(page.locator("text=Download Card").first()).toBeVisible();
  });

  test("growth radar is visible in sidebar", async ({ page }) => {
    await page.goto("/project/1");
    await expect(page.locator("text=Growth Radar").first()).toBeVisible({ timeout: 5000 });
  });
});
