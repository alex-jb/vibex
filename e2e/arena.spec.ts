import { test, expect } from "@playwright/test";

test.describe("Arena Battle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/arena");
  });

  test("shows arena terminal interface", async ({ page }) => {
    await expect(page.locator("text=VIBEX://ARENA")).toBeVisible({ timeout: 5000 });
  });

  test("random match button selects fighters", async ({ page }) => {
    const randomBtn = page.locator("button").filter({ hasText: /RANDOM|随机/ }).first();
    if (await randomBtn.isVisible()) {
      await randomBtn.click();
      await page.waitForTimeout(500);
      // Should show fighter panels after selection
      const fighters = page.locator("text=Lv");
      expect(await fighters.count()).toBeGreaterThan(0);
    }
  });

  test("roster shows available fighters", async ({ page }) => {
    await expect(page.locator("text=ROSTER").or(page.locator("text=阵容"))).toBeVisible({ timeout: 5000 });
  });
});
