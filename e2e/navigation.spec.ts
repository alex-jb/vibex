import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates to Explore page", async ({ page }) => {
    await page.goto("/explore");
    await expect(page).toHaveURL("/explore");
    await expect(page.locator("h1")).toContainText(/Explore|探索/);
  });

  test("navigates to Hunt page", async ({ page }) => {
    await page.goto("/hunt");
    await expect(page).toHaveURL("/hunt");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navigates to Arena page", async ({ page }) => {
    await page.goto("/arena");
    await expect(page).toHaveURL("/arena");
    await expect(page.locator("text=VIBEX://ARENA")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Agents page", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveURL("/agents");
    await expect(page.locator("text=AGENT")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Buddy page", async ({ page }) => {
    await page.goto("/buddy");
    await expect(page).toHaveURL("/buddy");
    await expect(page.locator("text=BUDDY")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Workflows page", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page).toHaveURL("/workflows");
    await expect(page.locator("text=WORKFLOW")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Analytics page", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).toHaveURL("/analytics");
    await expect(page.locator("text=ANALYTICS")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Developers page", async ({ page }) => {
    await page.goto("/developers");
    await expect(page).toHaveURL("/developers");
    await expect(page.locator("text=DEV-PORTAL")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("404 page shows for invalid routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.locator("text=404")).toBeVisible({ timeout: 5000 });
  });

  test("terms page exists", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("text=TERMS")).toBeVisible({ timeout: 5000 });
  });

  test("privacy page exists", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("text=PRIVACY")).toBeVisible({ timeout: 5000 });
  });

  test("about page exists", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=ABOUT")).toBeVisible({ timeout: 5000 });
  });

  test("VC dashboard page loads", async ({ page }) => {
    await page.goto("/vc/dashboard");
    await expect(page.locator("text=Investor").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Beta").first()).toBeVisible();
  });
});
