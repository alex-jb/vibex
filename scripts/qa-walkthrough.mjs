import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const SHOT = '.gstack/qa-reports/screenshots';
fs.mkdirSync(SHOT, { recursive: true });

// Guest-visible pages. Will also try a couple auth-gated ones to see redirect behavior.
const routes = [
  { path: '/', name: 'landing' },
  { path: '/home', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/hunt', name: 'hunt' },
  { path: '/creators', name: 'creators' },
  { path: '/ideas', name: 'ideas' },
  { path: '/insights', name: 'insights' },
  { path: '/dojo', name: 'dojo' },
  { path: '/events', name: 'events' },
  { path: '/analytics', name: 'analytics' },
  { path: '/arena', name: 'arena' },
  { path: '/feed', name: 'feed' },
  { path: '/developers', name: 'developers' },
  { path: '/launch', name: 'launch' },
  { path: '/buddy', name: 'buddy' },
  { path: '/create-card', name: 'create-card' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/settings', name: 'settings' },
  { path: '/profile', name: 'profile' },
  { path: '/messages', name: 'messages' },
  { path: '/workflows', name: 'workflows' },
  { path: '/project/2', name: 'project-2' },
  { path: '/creators/graph', name: 'creators-graph' },
  { path: '/insights/growth', name: 'insights-growth' },
  { path: '/vc/dashboard', name: 'vc-dashboard' },
];

const report = { date: new Date().toISOString(), base: BASE, pages: [] };

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 QA-Walkthrough/1.0',
});

for (const { path, name } of routes) {
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  const warns = [];

  page.on('console', (msg) => {
    const t = msg.type();
    const text = msg.text();
    if (t === 'error') errors.push(text);
    else if (t === 'warning') warns.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    failed.push({ url: r.url(), reason: r.failure()?.errorText || 'unknown' });
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.status() !== 401) {
      failed.push({ url: r.url(), reason: `HTTP ${r.status()}` });
    }
  });

  const t0 = Date.now();
  let status = null;
  let finalUrl = null;
  try {
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    status = resp?.status() ?? null;
    await page.waitForTimeout(1500);
    finalUrl = page.url();
    await page.screenshot({ path: `${SHOT}/${name}.png`, fullPage: false });
  } catch (e) {
    errors.push(`navigation: ${e.message.split('\n')[0]}`);
  }
  const dur = Date.now() - t0;

  // Count visible hamburger/nav links on this page
  let visibleLinks = 0;
  try { visibleLinks = await page.locator('a:visible').count(); } catch {}

  // Check for empty/skeleton state
  let bodyText = '';
  try { bodyText = (await page.locator('body').innerText()).slice(0, 200); } catch {}

  report.pages.push({
    path, name, status, finalUrl, durMs: dur,
    errors: errors.slice(0, 10),
    warns: warns.slice(0, 5),
    failed: failed.slice(0, 10),
    visibleLinks,
    bodyPreview: bodyText.replace(/\s+/g, ' ').slice(0, 120),
  });

  const redir = finalUrl && !finalUrl.endsWith(path) ? ` → ${finalUrl.replace(BASE, '')}` : '';
  const sev = errors.length ? '🔴' : failed.length ? '🟡' : '🟢';
  console.log(`${sev} ${status ?? '---'} ${path.padEnd(22)}${redir.padEnd(25)} errs=${errors.length} failed=${failed.length} (${dur}ms)`);

  await page.close();
}

fs.writeFileSync('.gstack/qa-reports/walkthrough.json', JSON.stringify(report, null, 2));
console.log(`\nReport: .gstack/qa-reports/walkthrough.json (${report.pages.length} pages)`);
await b.close();
