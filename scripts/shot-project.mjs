import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const sizes = [
  { name: '375', w: 375, h: 812 },
  { name: '1280', w: 1280, h: 900 },
];

for (const s of sizes) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/project/2', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `/tmp/project-${s.name}-fold.png`, clip: { x: 0, y: 0, width: s.w, height: s.h } });
  await page.screenshot({ path: `/tmp/project-${s.name}-full.png`, fullPage: true });
  await ctx.close();
  console.log(`${s.name}: OK`);
}
await b.close();
