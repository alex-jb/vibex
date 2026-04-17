import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Track all network requests
const resources = [];
page.on('response', async (response) => {
  const url = response.url();
  const status = response.status();
  try {
    const body = await response.body();
    resources.push({
      url: url.replace('http://localhost:3000', ''),
      type: response.headers()['content-type']?.split(';')[0] || 'unknown',
      size: body.length,
      status,
    });
  } catch {}
});

const start = Date.now();
await page.goto('http://localhost:3000/home', { waitUntil: 'networkidle', timeout: 30000 });
const loadTime = Date.now() - start;

// Scroll to bottom to trigger lazy-loaded images
for (let y = 0; y < 6000; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(100);
}
await page.waitForTimeout(2000);

// Get Web Vitals
const vitals = await page.evaluate(() => {
  const entries = performance.getEntriesByType('navigation');
  const nav = entries[0];
  return {
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0),
    loadComplete: Math.round(nav?.loadEventEnd || 0),
    domInteractive: Math.round(nav?.domInteractive || 0),
  };
});

// Aggregate
const images = resources.filter(r => r.type?.startsWith('image'));
const scripts = resources.filter(r => r.type?.includes('javascript'));
const css = resources.filter(r => r.type?.includes('css'));
const totalSize = resources.reduce((s, r) => s + r.size, 0);
const imgSize = images.reduce((s, r) => s + r.size, 0);
const jsSize = scripts.reduce((s, r) => s + r.size, 0);

console.log('=== /home Performance Audit ===');
console.log(`Load time (networkidle): ${loadTime}ms`);
console.log(`DOM interactive: ${vitals.domInteractive}ms`);
console.log(`DOMContentLoaded: ${vitals.domContentLoaded}ms`);
console.log(`Load complete: ${vitals.loadComplete}ms`);
console.log('');
console.log(`Total requests: ${resources.length}`);
console.log(`Total size: ${(totalSize / 1024).toFixed(0)} KB`);
console.log(`  Images: ${images.length} files, ${(imgSize / 1024).toFixed(0)} KB`);
console.log(`  Scripts: ${scripts.length} files, ${(jsSize / 1024).toFixed(0)} KB`);
console.log(`  CSS: ${css.length} files`);
console.log('');

// Top 10 largest assets
const sorted = [...resources].sort((a, b) => b.size - a.size);
console.log('Top 10 largest assets:');
for (const r of sorted.slice(0, 10)) {
  console.log(`  ${(r.size / 1024).toFixed(0).padStart(6)} KB  ${r.url.slice(0, 80)}`);
}

// Images > 100KB
const bigImages = images.filter(r => r.size > 100 * 1024);
if (bigImages.length > 0) {
  console.log(`\n⚠ ${bigImages.length} images over 100 KB:`);
  for (const r of bigImages.sort((a, b) => b.size - a.size)) {
    console.log(`  ${(r.size / 1024).toFixed(0).padStart(6)} KB  ${r.url.slice(0, 80)}`);
  }
}

await b.close();
