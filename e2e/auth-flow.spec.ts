import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("demo login works and redirects to home", async ({ page }) => {
    await page.goto("/login");
    // Click demo login button
    await page.getByRole("button", { name: /demo/i }).click();
    // Should redirect to home
    await page.waitForURL("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("email form validates required fields", async ({ page }) => {
    await page.goto("/login");
    // Try to submit empty form
    const submitBtn = page.getByRole("button", { name: /sign in/i });
    // Form should have required email input
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("register page is accessible from login", async ({ page }) => {
    await page.goto("/login");
    // Should have link to register
    await page.locator("a[href='/register']").click();
    await page.waitForURL("/register");
    await expect(page.locator("main")).toBeVisible();
  });
});
