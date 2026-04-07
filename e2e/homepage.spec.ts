import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows boot sequence", async ({ page }) => {
    await page.goto("/");
    // Boot sequence terminal should appear
    await expect(page.locator("text=VIBEX")).toBeVisible({ timeout: 10000 });
  });

  test("can skip boot sequence", async ({ page }) => {
    await page.goto("/");
    const skipBtn = page.locator("text=SKIP");
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }
    // After skip, main content should be visible
    await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
  });

  test("navbar has logo and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=VibeX")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});
