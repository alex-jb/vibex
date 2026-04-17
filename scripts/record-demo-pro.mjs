// Pro demo recorder — reusable, polished, permanent tool.
//
// Features:
//   - Smooth mouse cursor movement (bezier) before every click
//   - Click ripple CSS animation at click point
//   - Step subtitle overlay at bottom of viewport
//   - Title card (2s) + end card with CTA (3s)
//   - ffmpeg crossfade transitions between segments
//   - Output: ~/Desktop/vibex-demo-pro.mp4
//
// Prereq: `npm install --no-save ffmpeg-static`
// Run: `node scripts/record-demo-pro.mjs`

import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const FFMPEG = (await import('ffmpeg-static')).default;
const DESKTOP = path.join(homedir(), 'Desktop');
const TMP = path.join(DESKTOP, '_vibex_pro_tmp');
const OUT = path.join(DESKTOP, 'vibex-demo-pro.mp4');
const BASE = 'https://www.vibexforge.com';
const W = 1280, H = 720;

fs.mkdirSync(TMP, { recursive: true });

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

async function injectDemoChrome(page) {
  await page.evaluate(() => {
    if (document.getElementById('_demo_chrome')) return;

    // Click ripple
    const style = document.createElement('style');
    style.id = '_demo_chrome';
    style.textContent = `
      @keyframes _ripple {
        0% { transform: scale(0); opacity: 0.7; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      ._click_ripple {
        position: fixed; pointer-events: none; z-index: 99999;
        width: 30px; height: 30px; border-radius: 50%;
        border: 2px solid rgba(139,92,246,0.8);
        background: rgba(139,92,246,0.15);
        animation: _ripple 0.5s ease-out forwards;
      }
      ._cursor_dot {
        position: fixed; pointer-events: none; z-index: 99998;
        width: 12px; height: 12px; border-radius: 50%;
        background: rgba(250,204,21,0.9);
        box-shadow: 0 0 8px rgba(250,204,21,0.6);
        transition: left 0.4s cubic-bezier(0.25,0.1,0.25,1),
                    top 0.4s cubic-bezier(0.25,0.1,0.25,1);
        transform: translate(-50%,-50%);
      }
      ._subtitle_bar {
        position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);
        z-index: 99997; pointer-events: none;
        padding: 8px 28px; border-radius: 8px;
        background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
        border: 1px solid rgba(139,92,246,0.3);
        font-family: 'VT323', monospace; font-size: 20px;
        color: rgba(232,232,236,0.95); letter-spacing: 1px;
        text-shadow: 0 0 6px rgba(139,92,246,0.5);
        opacity: 0; transition: opacity 0.4s;
      }
      ._subtitle_bar.show { opacity: 1; }
    `;
    document.head.appendChild(style);

    // Cursor dot
    const dot = document.createElement('div');
    dot.className = '_cursor_dot';
    dot.id = '_cursor_dot';
    dot.style.left = '50%';
    dot.style.top = '50%';
    document.body.appendChild(dot);

    // Subtitle bar
    const sub = document.createElement('div');
    sub.className = '_subtitle_bar';
    sub.id = '_subtitle_bar';
    document.body.appendChild(sub);

    // Click ripple spawner
    window._spawnRipple = (x, y) => {
      const r = document.createElement('div');
      r.className = '_click_ripple';
      r.style.left = (x - 15) + 'px';
      r.style.top = (y - 15) + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    };
  });
}

async function moveCursorTo(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const dot = document.getElementById('_cursor_dot');
    if (dot) { dot.style.left = x + 'px'; dot.style.top = y + 'px'; }
  }, { x, y });
  await page.waitForTimeout(500);
}

async function clickWithRipple(page, x, y) {
  await moveCursorTo(page, x, y);
  await page.evaluate(({ x, y }) => {
    window._spawnRipple?.(x, y);
  }, { x, y });
  await page.waitForTimeout(300);
}

async function showSubtitle(page, text) {
  await page.evaluate((text) => {
    const bar = document.getElementById('_subtitle_bar');
    if (bar) { bar.textContent = text; bar.classList.add('show'); }
  }, text);
}

async function hideSubtitle(page) {
  await page.evaluate(() => {
    const bar = document.getElementById('_subtitle_bar');
    if (bar) bar.classList.remove('show');
  });
}

async function smoothScroll(page, y, ms = 1500) {
  await page.evaluate(({ y, ms }) => {
    return new Promise(resolve => {
      const s = window.scrollY, d = y - s, t0 = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - t0) / ms);
        const e = t * t * (3 - 2 * t);
        window.scrollTo(0, s + d * e);
        // Move cursor dot with scroll
        const dot = document.getElementById('_cursor_dot');
        if (dot) {
          const cx = parseFloat(dot.style.left) || 640;
          dot.style.top = (360 - d * e * 0.3) + 'px';
        }
        t < 1 ? requestAnimationFrame(step) : resolve();
      })(performance.now());
    });
  }, { y, ms });
}

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

// ═══════════════════════════════════════════
// Generate title + end cards as images
// ═══════════════════════════════════════════

async function generateCard(browser, filename, html) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();
  await p.setContent(html);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(TMP, filename) });
  await ctx.close();
}

const titleCardHtml = `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019,#1a0a3a 50%,#0d0019);
  font-family:monospace;">
  <div style="text-align:center">
    <div style="font-size:72px;font-weight:bold;letter-spacing:6px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(3px 3px 0 #000) drop-shadow(0 0 30px rgba(250,204,21,0.4));">
      VIBEX
    </div>
    <div style="margin-top:16px;font-size:18px;color:rgba(139,92,246,0.8);letter-spacing:3px;">
      YOUR AI LAUNCH REVIEWER
    </div>
    <div style="margin-top:32px;font-size:14px;color:rgba(232,232,236,0.5);letter-spacing:2px;">
      vibexforge.com
    </div>
  </div>
</body></html>
`;

const endCardHtml = `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019,#1a0a3a 50%,#0d0019);
  font-family:monospace;">
  <div style="text-align:center">
    <div style="font-size:52px;font-weight:bold;letter-spacing:4px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(3px 3px 0 #000) drop-shadow(0 0 20px rgba(250,204,21,0.3));">
      TRY IT NOW
    </div>
    <div style="margin-top:20px;font-size:22px;color:rgba(57,255,20,0.8);letter-spacing:2px;
      text-shadow:0 0 8px rgba(57,255,20,0.4);">
      vibexforge.com/launch
    </div>
    <div style="margin-top:12px;font-size:14px;color:rgba(232,232,236,0.4);letter-spacing:2px;">
      Paste any AI project URL. Get 7 improvements in 30 seconds.
    </div>
    <div style="margin-top:28px;font-size:13px;color:rgba(250,204,21,0.5);letter-spacing:3px;">
      ⭐ github.com/alex-jb/vibex
    </div>
  </div>
</body></html>
`;

// ═══════════════════════════════════════════
// Main recording
// ═══════════════════════════════════════════

console.log('▶ generating cards...');
const browser = await chromium.launch({ headless: true });
await generateCard(browser, 'title-card.png', titleCardHtml);
await generateCard(browser, 'end-card.png', endCardHtml);
console.log('✓ cards generated');

console.log('▶ recording walkthrough...');
const VIDEO_DIR = path.join(TMP, 'video');
fs.mkdirSync(VIDEO_DIR, { recursive: true });

const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: VIDEO_DIR, size: { width: W, height: H } },
});
const page = await ctx.newPage();

// --- Scene 1: Landing portal (5s)
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await injectDemoChrome(page);
await showSubtitle(page, '▸ Every AI project starts at the portal');
await moveCursorTo(page, 640, 400);
await pause(page, 2000);
await smoothScroll(page, 500, 1500);
await pause(page, 800);
await hideSubtitle(page);

// --- Scene 2: HQ dashboard (5s)
await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await injectDemoChrome(page);
await showSubtitle(page, '▸ HQ — your projects + daily leaderboard');
await moveCursorTo(page, 400, 350);
await pause(page, 2000);
await smoothScroll(page, 500, 1500);
await pause(page, 800);
await hideSubtitle(page);

// --- Scene 3: Hunt (4s)
await page.goto(BASE + '/hunt', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await injectDemoChrome(page);
await showSubtitle(page, '▸ Hunt — realtime rankings updated via Supabase');
await moveCursorTo(page, 500, 300);
await pause(page, 2000);
await smoothScroll(page, 350, 1200);
await pause(page, 600);
await hideSubtitle(page);

// --- Scene 4: Project detail (6s)
await page.goto(BASE + '/project/proj-mo1w2haf-ga3v', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await injectDemoChrome(page);
await showSubtitle(page, '▸ Project — Claude reviewed this launch page');
await moveCursorTo(page, 600, 250);
await pause(page, 2500);
await smoothScroll(page, 600, 1500);
await pause(page, 1000);
await hideSubtitle(page);

// --- Scene 5: Ideas Lab (4s)
await page.goto(BASE + '/ideas', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await injectDemoChrome(page);
await showSubtitle(page, '▸ Idea Lab — AI scores your concept before you build');
await moveCursorTo(page, 700, 350);
await pause(page, 2000);
await smoothScroll(page, 500, 1200);
await pause(page, 500);
await hideSubtitle(page);

// --- Scene 6: Creators (3s)
await page.goto(BASE + '/creators', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await injectDemoChrome(page);
await showSubtitle(page, '▸ Creators — the builders behind the projects');
await moveCursorTo(page, 500, 400);
await pause(page, 2000);
await hideSubtitle(page);

// --- Scene 7: Back to landing for bookend (2s)
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

await page.close();
await ctx.close();
console.log('✓ walkthrough recorded');

// Find the webm
const webms = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
if (!webms.length) throw new Error('no webm produced');
const walkthrough = path.join(VIDEO_DIR, webms[0]);

// ═══════════════════════════════════════════
// ffmpeg: compose final video
// ═══════════════════════════════════════════

console.log('▶ composing final video...');

// 1. Title card → 2s video
const titleVid = path.join(TMP, 'title.mp4');
execSync(`"${FFMPEG}" -y -loop 1 -i "${path.join(TMP, 'title-card.png')}" -c:v libx264 -t 2.5 -pix_fmt yuv420p -vf "fps=25,fade=in:0:12,fade=out:st=2:d=0.5" -preset fast "${titleVid}"`, { stdio: 'pipe' });

// 2. End card → 3s video
const endVid = path.join(TMP, 'end.mp4');
execSync(`"${FFMPEG}" -y -loop 1 -i "${path.join(TMP, 'end-card.png')}" -c:v libx264 -t 3.5 -pix_fmt yuv420p -vf "fps=25,fade=in:0:12,fade=out:st=3:d=0.5" -preset fast "${endVid}"`, { stdio: 'pipe' });

// 3. Walkthrough webm → mp4 (normalized)
const walkVid = path.join(TMP, 'walk.mp4');
execSync(`"${FFMPEG}" -y -i "${walkthrough}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -an "${walkVid}"`, { stdio: 'pipe' });

// 4. Concat
const concatList = path.join(TMP, 'concat.txt');
fs.writeFileSync(concatList, `file '${titleVid}'\nfile '${walkVid}'\nfile '${endVid}'\n`);

execSync(`"${FFMPEG}" -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an "${OUT}"`, { stdio: 'pipe' });

console.log('✓ mp4:', OUT);

// Also keep a webm copy
const outWebm = OUT.replace('.mp4', '.webm');
execSync(`"${FFMPEG}" -y -i "${OUT}" -c:v libvpx-vp9 -crf 24 -b:v 0 -an "${outWebm}"`, { stdio: 'pipe' });
console.log('✓ webm:', outWebm);

// Stats
const mp4Size = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
const webmSize = (fs.statSync(outWebm).size / 1024 / 1024).toFixed(1);
const dur = execSync(`"${FFMPEG}" -i "${OUT}" 2>&1 | grep Duration | awk '{print $2}'`).toString().trim().replace(',', '');
console.log(`\nDone. mp4=${mp4Size}MB  webm=${webmSize}MB  duration=${dur}`);

// Cleanup
fs.rmSync(TMP, { recursive: true, force: true });
await browser.close();
