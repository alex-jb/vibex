// Records a 30-second guest-visible walkthrough of prod vibexforge.com and
// drops both .webm and .mp4 onto ~/Desktop/ for Twitter / HN / Product Hunt.
//
// Prereq: `npm install --no-save ffmpeg-static` (bundled ffmpeg binary, no
// brew needed). --no-save keeps it out of package.json because it's a ~80MB
// dev tool, not a runtime dep.
//
// Run: `node scripts/record-demo.mjs`
// Output: ~/Desktop/vibex-demo.{mp4,webm}

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const FFMPEG = (await import('ffmpeg-static')).default;
const DESKTOP = path.join(homedir(), 'Desktop');
const VIDEO_DIR = path.join(DESKTOP, '_vibex_record_tmp');
const OUT_WEBM = path.join(DESKTOP, 'vibex-demo.webm');
const OUT_MP4 = path.join(DESKTOP, 'vibex-demo.mp4');
const BASE = 'https://www.vibexforge.com';

fs.mkdirSync(VIDEO_DIR, { recursive: true });

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
  deviceScaleFactor: 1,
});

const page = await ctx.newPage();

async function pause(ms) {
  await page.waitForTimeout(ms);
}

async function smoothScrollTo(y, durMs = 1500) {
  await page.evaluate(({ y, durMs }) => {
    return new Promise((resolve) => {
      const startY = window.scrollY;
      const delta = y - startY;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / durMs);
        const eased = t * t * (3 - 2 * t); // smoothstep
        window.scrollTo(0, startY + delta * eased);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }, { y, durMs });
}

console.log('▶ recording...');

// 1. Landing — 5s. Hold on the portal, then scroll to reveal more.
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await pause(3000);
await smoothScrollTo(600, 1500);
await pause(800);

// 2. HQ — 5s. Show dashboard above the fold, then scroll.
await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });
await pause(2500);
await smoothScrollTo(500, 1500);
await pause(1000);

// 3. Hunt — 4s. Show the live leaderboard.
await page.goto(BASE + '/hunt', { waitUntil: 'domcontentloaded' });
await pause(2000);
await smoothScrollTo(400, 1500);
await pause(500);

// 4. Project detail — 5s. The Launch Feedback target.
await page.goto(BASE + '/project/proj-mo1w2haf-ga3v', { waitUntil: 'domcontentloaded' });
await pause(3000);
await smoothScrollTo(500, 1500);
await pause(500);

// 5. Ideas Lab — 4s. AI scoring before you build.
await page.goto(BASE + '/ideas', { waitUntil: 'domcontentloaded' });
await pause(2000);
await smoothScrollTo(600, 1500);
await pause(500);

// 6. Creators — 3s. The humans.
await page.goto(BASE + '/creators', { waitUntil: 'domcontentloaded' });
await pause(2500);

// 7. Back to landing for brand bookend — 3s.
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await pause(2500);

await page.close();

// Playwright finalizes the video on context close
await ctx.close();
await b.close();

// Find the webm Playwright just wrote
const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
if (!files.length) throw new Error('no webm produced');
const webmRaw = path.join(VIDEO_DIR, files[0]);

// Move to Desktop as vibex-demo.webm
fs.copyFileSync(webmRaw, OUT_WEBM);
console.log('✓ webm:', OUT_WEBM);

// Transcode to mp4 (H.264 + AAC) for Twitter / HN compatibility
await new Promise((resolve, reject) => {
  const proc = spawn(FFMPEG, [
    '-y',
    '-i', webmRaw,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',                      // no audio track — Twitter fine, HN fine
    OUT_MP4,
  ], { stdio: 'inherit' });
  proc.on('exit', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code)));
});

console.log('✓ mp4:', OUT_MP4);

// Cleanup tmp
fs.rmSync(VIDEO_DIR, { recursive: true, force: true });

const webmSize = (fs.statSync(OUT_WEBM).size / 1024 / 1024).toFixed(1);
const mp4Size = (fs.statSync(OUT_MP4).size / 1024 / 1024).toFixed(1);
console.log(`\nDone. webm=${webmSize}MB  mp4=${mp4Size}MB`);
