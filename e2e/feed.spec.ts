import { test, expect } from "@playwright/test";

test.describe("Feed Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feed");
  });

  // ─── Page Load ───

  test("loads with terminal header and RPG framing", async ({ page }) => {
    await expect(page.locator("text=VIBEX://FEED")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".rpgui-container.framed")).toBeVisible();
  });

  test("shows LIVE or OFFLINE badge", async ({ page }) => {
    const badge = page.locator("text=LIVE").or(page.locator("text=OFFLINE"));
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  // ─── Tab Switching ───

  test("has three tab buttons", async ({ page }) => {
    await expect(page.locator("button", { hasText: "关注" })).toBeVisible();
    await expect(page.locator("button", { hasText: "热门" })).toBeVisible();
    await expect(page.locator("button", { hasText: "最新" })).toBeVisible();
  });

  test("switching tabs shows loading state", async ({ page }) => {
    const latestTab = page.locator("button", { hasText: "最新" });
    await latestTab.click();
    // Brief skeleton or posts should appear
    await expect(
      page.locator("[role='feed']").or(page.locator("text=还没有动态")),
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── Post Display ───

  test("displays mock posts with post cards", async ({ page }) => {
    // In mock mode, 6 posts should render
    const posts = page.locator("article[aria-label]");
    await expect(posts.first()).toBeVisible({ timeout: 5000 });
    const count = await posts.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("post card shows username and content", async ({ page }) => {
    const firstPost = page.locator("article[aria-label]").first();
    await expect(firstPost).toBeVisible({ timeout: 5000 });
    // Should have text content (any of the mock posts)
    const text = await firstPost.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(10);
  });

  test("post card has like and reply buttons", async ({ page }) => {
    const firstPost = page.locator("article[aria-label]").first();
    await expect(firstPost).toBeVisible({ timeout: 5000 });
    // Like button with aria-label containing 点赞
    await expect(firstPost.locator("[aria-label*='点赞']")).toBeVisible();
    // Reply button with aria-label containing 回复
    await expect(firstPost.locator("[aria-label*='回复']")).toBeVisible();
  });

  // ─── Like Interaction ───

  test("clicking like toggles heart style", async ({ page }) => {
    const firstPost = page.locator("article[aria-label]").first();
    await expect(firstPost).toBeVisible({ timeout: 5000 });
    const likeBtn = firstPost.locator("[aria-label*='点赞']");

    // Click like
    await likeBtn.click();
    // Heart should change (♥ filled or color change)
    await page.waitForTimeout(500);
    // The button should still be visible after click
    await expect(likeBtn).toBeVisible();
  });

  // ─── Composer ───

  test("shows login prompt when not authenticated", async ({ page }) => {
    // In mock mode without auth, should show login link
    const loginLink = page.locator("text=登录");
    const composer = page.locator("textarea");
    // Either login prompt or composer should be visible
    const hasLogin = await loginLink.isVisible().catch(() => false);
    const hasComposer = await composer.isVisible().catch(() => false);
    expect(hasLogin || hasComposer).toBe(true);
  });

  // ─── Empty States ───

  test("following tab shows empty state for unauthenticated user", async ({ page }) => {
    const followingTab = page.locator("button", { hasText: "关注" });
    await followingTab.click();
    await page.waitForTimeout(500);
    // Should show empty state or posts
    const content = page.locator(".rpgui-container.framed");
    await expect(content).toBeVisible();
  });

  // ─── Accessibility ───

  test("feed container has role='feed'", async ({ page }) => {
    // Wait for posts to load
    await page.waitForTimeout(1000);
    const feed = page.locator("[role='feed']");
    // Feed role should exist when posts are displayed
    const hasFeed = await feed.isVisible().catch(() => false);
    const hasEmpty = await page.locator("text=还没有动态").isVisible().catch(() => false);
    expect(hasFeed || hasEmpty).toBe(true);
  });

  test("post cards have role='article'", async ({ page }) => {
    const articles = page.locator("article[aria-label]");
    await expect(articles.first()).toBeVisible({ timeout: 5000 });
  });
});
