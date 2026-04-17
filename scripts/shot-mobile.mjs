import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const url = process.env.URL || 'http://localhost:3000/home';
const sizes = [
  { name: '375', w: 375, h: 812 },
  { name: '768', w: 768, h: 1024 },
  { name: '1280', w: 1280, h: 900 },
];
for (const s of sizes) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `/tmp/home-${s.name}-fold.png`, clip: { x: 0, y: 0, width: s.w, height: s.h } });
  await page.screenshot({ path: `/tmp/home-${s.name}-full.png`, fullPage: true });
  await ctx.close();
  console.log(`${s.name}: OK`);
}
await b.close();
