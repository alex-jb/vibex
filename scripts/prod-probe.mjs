import { chromium } from 'playwright';

const targets = [
  'https://www.vibexforge.com/home',
  'https://vibexforge.com/home',
  'https://vibecode-hunt-qsm8h429y-alex-jbs-projects.vercel.app/home',
];

const b = await chromium.launch({ headless: true });
for (const url of targets) {
  const p = await b.newPage();
  try {
    const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log(`OK   ${url.padEnd(80)} ${r.status()}`);
  } catch (e) {
    console.log(`FAIL ${url.padEnd(80)} ${e.message.split('\n')[0]}`);
  }
  await p.close();
}
await b.close();
