import { chromium } from 'playwright';

const pages = [
  { path: '/', name: 'landing' },
  { path: '/home', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/project/2', name: 'project' },
  { path: '/arena', name: 'arena' },
  { path: '/creators', name: 'creators' },
  { path: '/ideas', name: 'ideas' },
  { path: '/analytics', name: 'analytics' },
  { path: '/insights', name: 'insights' },
  { path: '/dojo', name: 'dojo' },
  { path: '/hunt', name: 'hunt' },
  { path: '/feed', name: 'feed' },
  { path: '/about', name: 'about' },
];

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });

for (const { path, name } of pages) {
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const outfile = `/tmp/audit-${name}.png`;
    await page.screenshot({ path: outfile });
    console.log(`OK   ${name.padEnd(15)} ${path}`);
  } catch (e) {
    console.log(`FAIL ${name.padEnd(15)} ${path}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

await b.close();
