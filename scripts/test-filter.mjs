import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:3000/home', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll filter pills into view
await page.evaluate(() => {
  const el = document.querySelector('button[aria-pressed="true"]');
  if (el) el.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);

// Screenshot: ALL active (default)
await page.screenshot({ path: '/tmp/filter-all.png', clip: { x: 0, y: 200, width: 1280, height: 700 } });

// Click AI GAME pill
const gameBtn = await page.$('button:has-text("AI GAME")');
if (gameBtn) {
  await gameBtn.click();
  await page.waitForTimeout(500);
}

// Screenshot: AI GAME active
await page.screenshot({ path: '/tmp/filter-game.png', clip: { x: 0, y: 200, width: 1280, height: 700 } });

// Check what's in the legendary grid now
const firstCardName = await page.$$eval('#heroes a[href^="/project/"]', els =>
  els.slice(0, 9).map(e => ({
    href: e.getAttribute('href'),
    name: e.querySelector('[class*=font-pixel]')?.textContent?.trim(),
  }))
);
console.log('Cards visible after AI GAME filter:');
console.log(JSON.stringify(firstCardName, null, 2));

await b.close();
