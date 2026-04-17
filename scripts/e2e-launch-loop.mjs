/**
 * E2E: Launch Feedback Loop against production.
 *
 * Flow:
 *   1. Sign up a fresh email+password user via playwright on /login
 *   2. Redirect lands us on /launch (or /home) — navigate to /launch
 *   3. Fill URL paste hero + form
 *   4. Submit — expect 201 with persisted:true
 *   5. Land on /project/proj-xxxxx — screenshot
 *   6. Navigate to /home — screenshot JUST LAUNCHED row (should show new card)
 *
 * Screenshots saved to /tmp/e2e-step-{n}-*.png
 */

import { chromium } from 'playwright';

const BASE = 'https://www.vibexforge.com';
const email = `vibex-e2e-${Date.now()}@example.com`;
const password = `vibex-test-${Math.random().toString(36).slice(2)}`;

console.log(`Test user: ${email}`);

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

page.on('response', (res) => {
  const url = res.url();
  if (url.includes('/api/projects/submit')) {
    console.log(`[api] ${res.status()} ${url}`);
  }
});

// ─── Step 1: sign up ───
console.log('\n▸ Step 1: sign up');
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(1500);

// Dismiss tutorial overlay if it appears
const skipBtn = await page.$('button:has-text("SKIP"), button:has-text("Skip")');
if (skipBtn) { await skipBtn.click().catch(() => {}); await page.waitForTimeout(300); }

// Look for "CREATE ACCOUNT" link or tab switch
const createAccountLink = await page.$('a:has-text("CREATE ACCOUNT"), button:has-text("CREATE ACCOUNT"), a:has-text("Sign up"), button:has-text("Sign up")');
if (createAccountLink) {
  console.log('  clicking CREATE ACCOUNT');
  await createAccountLink.click();
  await page.waitForTimeout(500);
}

// Fill email + password
const emailInput = await page.$('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
const passwordInput = await page.$('input[type="password"]');
if (!emailInput || !passwordInput) {
  console.log('  ❌ Could not find email/password inputs');
  await page.screenshot({ path: '/tmp/e2e-debug-login.png' });
  process.exit(1);
}
await emailInput.fill(email);
await passwordInput.fill(password);
await page.screenshot({ path: '/tmp/e2e-step-1-login-filled.png' });

// Submit
const submitBtn = await page.$('button[type="submit"], button:has-text("SIGN IN"), button:has-text("SIGN UP")');
if (!submitBtn) {
  console.log('  ❌ No submit button');
  process.exit(1);
}
await submitBtn.click();
await page.waitForTimeout(4000);

console.log(`  post-signup URL: ${page.url()}`);
await page.screenshot({ path: '/tmp/e2e-step-2-post-signup.png' });

// ─── Step 2: go to /launch ───
console.log('\n▸ Step 2: navigate /launch');
await page.goto(`${BASE}/launch`, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2500);
console.log(`  on: ${page.url()}`);

if (!page.url().includes('/launch')) {
  console.log('  ❌ redirected away from /launch — signup likely failed');
  await page.screenshot({ path: '/tmp/e2e-debug-launch-redirect.png' });
  process.exit(1);
}

// ─── Step 3: URL paste hero ───
console.log('\n▸ Step 3: URL paste');
const urlInput = await page.$('input[placeholder*="paste"], input[type="text"]');
if (urlInput) {
  await urlInput.fill('https://github.com/vercel/next.js');
  await page.waitForTimeout(300);
  // Submit via Enter or the ▶ button
  await urlInput.press('Enter');
  await page.waitForTimeout(3500);
}

await page.screenshot({ path: '/tmp/e2e-step-3-form.png', fullPage: true });

// ─── Step 4: fill form + submit ───
console.log('\n▸ Step 4: fill + submit');

// Title
const titleInput = await page.$('input[placeholder*="title" i], input[placeholder*="Title" i]');
if (titleInput) await titleInput.fill('VibeX E2E Test Hero');

// Tagline
const taglineInput = await page.$('input[placeholder*="tagline" i], input[placeholder*="hook" i]');
if (taglineInput) await taglineInput.fill('The very first real project through the closed launch loop');

// Description (textarea)
const descInput = await page.$('textarea');
if (descInput) await descInput.fill('This project was submitted automatically by the Playwright E2E test to verify the Launch Feedback Loop is working end to end after the 038 migration and Vercel domain fix. It should persist to Supabase and appear on /home in the JUST LAUNCHED row.');

// Category — shadcn Select, may need special handling
const selectTrigger = await page.$('[role="combobox"], button[aria-haspopup="listbox"]');
if (selectTrigger) {
  await selectTrigger.click();
  await page.waitForTimeout(400);
  const option = await page.$('[role="option"]:has-text("AI Tool"), [role="option"]:has-text("AI AGENT")');
  if (option) await option.click();
  await page.waitForTimeout(300);
}

await page.screenshot({ path: '/tmp/e2e-step-4-form-filled.png', fullPage: true });

// Find + click the main submit button (not the URL hero ▶)
const finalSubmit = await page.$('button[type="submit"]:has-text("Launch"), button[type="submit"]:has-text("Submit"), button[type="submit"]:has-text("Forge"), form button[type="submit"]');
if (!finalSubmit) {
  console.log('  ❌ no submit button on form');
  process.exit(1);
}
await finalSubmit.click();

// Wait for either redirect or error
await page.waitForTimeout(4500);
const finalUrl = page.url();
console.log(`  final URL: ${finalUrl}`);

// ─── Step 5: verify on /project/[id] ───
if (finalUrl.includes('/project/')) {
  console.log(`  ✅ redirected to project page`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/e2e-step-5-project.png', fullPage: false, clip: {x:0, y:0, width:1280, height:900} });
} else {
  console.log(`  ⚠ still on ${finalUrl} — checking for error`);
  await page.screenshot({ path: '/tmp/e2e-step-5-no-redirect.png', fullPage: true });
}

// ─── Step 6: /home JUST LAUNCHED ───
console.log('\n▸ Step 6: /home JUST LAUNCHED row');
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
// Scroll to JUST LAUNCHED row
await page.evaluate(() => {
  const h = [...document.querySelectorAll('div')].find(el => el.textContent?.includes('JUST LAUNCHED'));
  if (h) h.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/e2e-step-6-home-just-launched.png', fullPage: false });

// ─── Final: check API count ───
const apiRes = await page.evaluate(() => fetch('/api/data/projects').then(r => r.json()));
const total = apiRes.length;
const realSubmits = apiRes.filter(p => String(p.id).startsWith('proj-'));
console.log(`\n▸ After test: total=${total}, real_submits=${realSubmits.length}`);
if (realSubmits.length > 0) {
  console.log(`  First real submit: ${realSubmits[0].id} / ${realSubmits[0].title}`);
}

await b.close();
console.log('\nDone. Screenshots in /tmp/e2e-step-*.png');
