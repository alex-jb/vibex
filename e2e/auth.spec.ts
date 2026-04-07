import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("login page has OAuth buttons", async ({ page }) => {
    await page.goto("/login");
    // Should have GitHub and Google login buttons
    await expect(page.locator("text=GitHub")).toBeVisible();
    await expect(page.locator("text=Google")).toBeVisible();
  });

  test("can toggle between login and register", async ({ page }) => {
    await page.goto("/login");
    const toggleBtn = page.locator("text=还没有账号").or(page.locator("text=注册"));
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(page.locator("text=加入冒险")).toBeVisible();
    }
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/profile");
    // Should redirect to login (middleware)
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("settings redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
