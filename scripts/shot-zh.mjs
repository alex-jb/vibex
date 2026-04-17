import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
// Seed localStorage BEFORE the page loads so LangProvider reads it on mount.
await page.addInitScript(() => {
  localStorage.setItem('vibecode-hunt-lang', 'zh');
});
await page.goto('http://localhost:3000/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: '/tmp/home-zh-fold.png', clip: { x: 0, y: 0, width: 1280, height: 900 } });
await b.close();
console.log('OK');
