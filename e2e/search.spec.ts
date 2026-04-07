import { test, expect } from "@playwright/test";

test.describe("Global Search (Ctrl+K)", () => {
  test("opens search dialog with Ctrl+K", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Control+k");
    // Search dialog should appear
    const dialog = page.locator("input[placeholder*='搜索']");
    await expect(dialog).toBeVisible({ timeout: 3000 });
  });

  test("search returns results for project name", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Control+k");
    const input = page.locator("input[placeholder*='搜索']");
    await input.fill("Translate");
    await page.waitForTimeout(500);
    // Should show at least one result
    const results = page.locator("[class*='hover\\:bg']");
    expect(await results.count()).toBeGreaterThan(0);
  });

  test("closes search dialog with Escape", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Control+k");
    await page.keyboard.press("Escape");
    const dialog = page.locator("input[placeholder*='搜索']");
    await expect(dialog).not.toBeVisible({ timeout: 2000 });
  });
});
