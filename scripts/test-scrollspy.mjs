import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
// xl: breakpoint is 1280 — dot nav hidden below
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:3000/home', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);

const targets = ['top', 'features', 'heroes', 'voices', 'forge'];

for (const id of targets) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, id);
  await page.waitForTimeout(700);
  const activeDot = await page.$eval('nav[aria-label="Section navigation"] a[aria-current="location"]', el => el.textContent?.trim());
  console.log(`Scrolled to #${id} → active dot: ${activeDot ?? '(none)'}`);
}

await b.close();
