import { chromium } from 'playwright';

const pages = [
  '/hunt', '/ideas', '/creators', '/events',
  '/insights', '/dojo', '/developers', '/analytics',
  '/feed', '/about',
];

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });

for (const path of pages) {
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1200);
    const slug = path.replace(/\//g, '-').slice(1) || 'root';
    await page.screenshot({ path: `/tmp/page-${slug}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });
    console.log(`OK   ${path}`);
  } catch (e) {
    console.log(`FAIL ${path}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}
await b.close();
