import { chromium } from 'playwright';

const BASE = 'http://localhost:3400';
const routes = ['/', '/home', '/hunt', '/creators', '/ideas', '/insights', '/analytics', '/project/2'];

const b = await chromium.launch({ headless: true });
const report = [];

for (const path of routes) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const resources = [];
  page.on('response', async (r) => {
    try {
      const body = await r.body();
      resources.push({
        url: r.url().replace(BASE, ''),
        type: (r.headers()['content-type'] || '').split(';')[0] || 'unknown',
        size: body.length,
        status: r.status(),
      });
    } catch {}
  });

  const t0 = Date.now();
  let loadTime = 0;
  let vitals = {};
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    loadTime = Date.now() - t0;
    vitals = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime;
      return {
        dcl: Math.round(n?.domContentLoadedEventEnd || 0),
        domInter: Math.round(n?.domInteractive || 0),
        fcp: Math.round(fcp || 0),
        ttfb: Math.round(n?.responseStart || 0),
      };
    });
  } catch (e) {
    report.push({ path, error: e.message.split('\n')[0] });
    await ctx.close();
    continue;
  }

  const imgs = resources.filter(r => r.type.startsWith('image'));
  const js = resources.filter(r => r.type.includes('javascript'));
  const css = resources.filter(r => r.type.includes('css'));
  const total = resources.reduce((s, r) => s + r.size, 0);
  const imgSize = imgs.reduce((s, r) => s + r.size, 0);
  const jsSize = js.reduce((s, r) => s + r.size, 0);
  const cssSize = css.reduce((s, r) => s + r.size, 0);

  // Top 5 assets
  const top = [...resources].sort((a, b) => b.size - a.size).slice(0, 5)
    .map(r => `${(r.size/1024).toFixed(0)}KB ${r.url.slice(0, 60)}`);

  report.push({
    path, loadTime, vitals,
    total: Math.round(total / 1024),
    jsSize: Math.round(jsSize / 1024), jsCount: js.length,
    cssSize: Math.round(cssSize / 1024), cssCount: css.length,
    imgSize: Math.round(imgSize / 1024), imgCount: imgs.length,
    top,
  });
  await ctx.close();
}

await b.close();

console.log('\n=== Perf Audit (prod build on :3100) ===\n');
console.log('route'.padEnd(16), 'load'.padStart(6), 'fcp'.padStart(6), 'dcl'.padStart(6), '  total', '   js', '  css', '  img');
for (const r of report) {
  if (r.error) { console.log(r.path.padEnd(16), 'ERR', r.error.slice(0, 60)); continue; }
  console.log(
    r.path.padEnd(16),
    (r.loadTime + 'ms').padStart(6),
    (r.vitals.fcp + 'ms').padStart(6),
    (r.vitals.dcl + 'ms').padStart(6),
    (r.total + 'KB').padStart(7),
    (r.jsSize + 'KB').padStart(6),
    (r.cssSize + 'KB').padStart(5),
    (r.imgSize + 'KB').padStart(6),
  );
}

console.log('\n=== Top 5 largest assets per route ===\n');
for (const r of report) {
  if (r.error) continue;
  console.log(r.path);
  r.top.forEach(t => console.log('  ', t));
}

// Heavy images check
console.log('\n=== Images > 200KB ===\n');
const seen = new Set();
for (const r of report) {
  if (r.error) continue;
  for (const t of r.top) {
    const m = t.match(/^(\d+)KB (.+)$/);
    if (m && parseInt(m[1]) > 200 && !seen.has(m[2]) && (m[2].endsWith('.png') || m[2].endsWith('.jpg') || m[2].endsWith('.webp'))) {
      seen.add(m[2]);
      console.log(`  ${m[1]}KB ${m[2]}`);
    }
  }
}
