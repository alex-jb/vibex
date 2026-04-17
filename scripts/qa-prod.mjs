import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'https://www.vibexforge.com';
const SHOT = '.gstack/qa-reports/screenshots/prod';
fs.mkdirSync(SHOT, { recursive: true });

// Guest-visible routes + an auth-gated one (to verify gate).
const routes = [
  { path: '/', name: 'landing' },
  { path: '/home', name: 'home' },
  { path: '/hunt', name: 'hunt' },
  { path: '/creators', name: 'creators' },
  { path: '/ideas', name: 'ideas' },
  { path: '/insights', name: 'insights' },
  { path: '/dojo', name: 'dojo' },
  { path: '/analytics', name: 'analytics' },
  { path: '/events', name: 'events' },
  { path: '/launch', name: 'launch-gate' },
  { path: '/project/proj-mo1w2haf-ga3v', name: 'real-project' },
];

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const results = [];

for (const { path, name } of routes) {
  const page = await ctx.newPage();
  const errs = [];
  const failed = [];
  page.on('console', m => m.type()==='error' && errs.push(m.text().slice(0,200)));
  page.on('pageerror', e => errs.push('PE: '+e.message.slice(0,200)));
  page.on('response', r => r.status()>=500 && failed.push(`${r.status()} ${r.url()}`));

  let status = null, finalUrl = null;
  const t0 = Date.now();
  try {
    const resp = await page.goto(BASE+path, { waitUntil: 'domcontentloaded', timeout: 25000 });
    status = resp?.status();
    await page.waitForTimeout(1800);
    finalUrl = page.url();
    await page.screenshot({ path: `${SHOT}/${name}.png`, fullPage: false });
  } catch (e) { errs.push('nav: '+e.message.slice(0,150)); }
  const dur = Date.now()-t0;

  // Filter known-benign CSP warning
  const realErrs = errs.filter(e => !e.includes('upgrade-insecure-requests'));
  const redir = finalUrl?.replace(BASE, '') !== path ? `→ ${finalUrl?.replace(BASE, '')}` : '';
  const sev = realErrs.length ? '🔴' : failed.length ? '🟡' : '🟢';
  console.log(`${sev} ${status||'---'} ${path.padEnd(36)}${redir.padEnd(32)} errs=${realErrs.length} ${dur}ms`);
  results.push({ path, name, status, finalUrl, dur, errs: realErrs, failed });
  await page.close();
}
await b.close();

fs.writeFileSync('.gstack/qa-reports/prod-walkthrough.json', JSON.stringify(results, null, 2));
console.log(`\nReport: .gstack/qa-reports/prod-walkthrough.json`);

// Summary
const red = results.filter(r => r.errs.length).length;
const gated = results.filter(r => r.finalUrl?.includes('/login?')).length;
const redirected = results.filter(r => r.finalUrl && r.finalUrl.replace(BASE,'') !== r.path).length;
console.log(`${red} pages with real errors, ${gated} correctly auth-gated, ${redirected} total redirects`);
