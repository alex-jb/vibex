import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const sizes = [
  { name: '375', w: 375, h: 812 },
  { name: '768', w: 768, h: 1024 },
  { name: '1280', w: 1280, h: 900 },
];
for (const s of sizes) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  // Pre-seed localStorage to skip tutorial + mark demo-authed
  await page.addInitScript(() => {
    try {
      localStorage.setItem('vibex-tutorial-seen', 'true');
      localStorage.setItem('vibex-tutorial-completed', 'true');
      sessionStorage.setItem('vibex-demo-session', '1');
    } catch {}
  });
  // Sign in via demo mode first
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);
  // Click any tutorial SKIP button if it showed up
  const skip = await page.$('button:has-text("SKIP"), button:has-text("Skip")');
  if (skip) {
    await skip.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  const demo = await page.$('button:has-text("PRESS START"), button:has-text("DEMO MODE"), button:has-text("DEMO")');
  if (demo) {
    await demo.click();
    await page.waitForTimeout(500);
  }
  // Now go to /launch
  await page.goto('http://localhost:3000/launch', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `/tmp/launch-${s.name}-hero.png`, clip: { x: 0, y: 0, width: s.w, height: Math.min(s.h, 2000) } });
  // Push past URL hero into the form
  try {
    const input = await page.$('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]');
    if (input) {
      await input.fill('https://example.com/test-project');
      await page.waitForTimeout(200);
      const go = await page.$('button:has-text("GO"), button:has-text("SCRAPE"), button[type="submit"]');
      if (go) await go.click();
      await page.waitForTimeout(1200);
    }
  } catch {}
  await page.screenshot({ path: `/tmp/launch-${s.name}-form.png`, fullPage: true });
  await ctx.close();
  console.log(`${s.name}: OK`);
}
await b.close();
