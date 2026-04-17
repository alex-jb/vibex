import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('https://www.vibexforge.com/home', { waitUntil: 'domcontentloaded', timeout: 25000 });
await page.waitForTimeout(4000);
for (let y = 0; y < 7000; y += 600) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/home-prod.png', fullPage: true });
await page.screenshot({ path: '/tmp/home-prod-fold.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
console.log('OK');
await b.close();
