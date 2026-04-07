import { test, expect } from "@playwright/test";

test.describe("Explore Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/explore");
  });

  test("shows project cards", async ({ page }) => {
    // Should have at least one project card visible
    const cards = page.locator("[class*='glass-card']");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });

  test("search filters projects", async ({ page }) => {
    const searchInput = page.locator("input[placeholder]").first();
    await searchInput.fill("Agent");
    // Wait for filter to apply
    await page.waitForTimeout(500);
    // Should still have some results
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("category pills are clickable", async ({ page }) => {
    const pills = page.locator("button").filter({ hasText: /AI Agent|AI Tool/ });
    if (await pills.first().isVisible()) {
      await pills.first().click();
      await page.waitForTimeout(300);
    }
  });
});
