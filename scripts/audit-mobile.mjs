import { chromium } from 'playwright';

const pages = [
  { path: '/', name: 'landing' },
  { path: '/home', name: 'home' },
  { path: '/login', name: 'login' },
];

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } });

for (const { path, name } of pages) {
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const outfile = `/tmp/audit-${name}-mobile.png`;
    await page.screenshot({ path: outfile });
    console.log(`OK   ${name}-mobile`);
  } catch (e) {
    console.log(`FAIL ${name}-mobile: ${e.message}`);
  }
  await page.close();
}

await b.close();
