// Ultimate demo: TTS narration + 8-bit ambient + cursor + subtitles + cards.
//
// Prereqs:
//   npm install --no-save ffmpeg-static
//   pip3 install edge-tts
//
// Run: node scripts/record-demo-ultimate.mjs

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const FFMPEG = (await import('ffmpeg-static')).default;
const EDGE_TTS = path.join(homedir(), 'Library/Python/3.9/bin/edge-tts');
const DESKTOP = path.join(homedir(), 'Desktop');
const TMP = path.join(DESKTOP, '_vibex_ultimate_tmp');
const OUT = path.join(DESKTOP, 'vibex-demo-ultimate.mp4');
const BASE = 'https://www.vibexforge.com';
const W = 1280, H = 720;
const VOICE = 'en-US-AndrewNeural';

fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(path.join(TMP, 'audio'), { recursive: true });
fs.mkdirSync(path.join(TMP, 'video'), { recursive: true });

// ═══════════════════════════════════════════
// 1. Narration script — one segment per scene
// ═══════════════════════════════════════════

const scenes = [
  {
    id: 'title',
    narration: 'VibeX. Your AI project launch page, reviewed by Claude in 30 seconds.',
    subtitle: '',
    type: 'card',
  },
  {
    id: 'landing',
    narration: 'Every session starts at the portal. This is where builders enter.',
    subtitle: '▸ The Portal — where it all starts',
    url: '/',
    scrollTo: 500,
    cursorTarget: [640, 380],
  },
  {
    id: 'home',
    narration: 'Your HQ. All your projects, today\'s leaderboard, and your next move.',
    subtitle: '▸ HQ — projects + daily leaderboard',
    url: '/home',
    scrollTo: 500,
    cursorTarget: [400, 320],
  },
  {
    id: 'hunt',
    narration: 'The Hunt. Real-time rankings powered by Supabase. Updated live.',
    subtitle: '▸ Hunt — realtime rankings via Supabase',
    url: '/hunt',
    scrollTo: 400,
    cursorTarget: [500, 300],
  },
  {
    id: 'project',
    narration: 'Each project gets a Claude review. 5 to 7 concrete, clickable actions you can apply right now.',
    subtitle: '▸ Claude reviewed this page → 7 actions',
    url: '/project/proj-mo1w2haf-ga3v',
    scrollTo: 600,
    cursorTarget: [600, 250],
    extraPause: 1500,
  },
  {
    id: 'ideas',
    narration: 'The Idea Lab. Score your concept before you write a single line of code.',
    subtitle: '▸ Idea Lab — AI scores before you build',
    url: '/ideas',
    scrollTo: 500,
    cursorTarget: [700, 350],
  },
  {
    id: 'creators',
    narration: 'And the creators behind it all. Ranked by what they shipped.',
    subtitle: '▸ Creators — the builders',
    url: '/creators',
    scrollTo: 0,
    cursorTarget: [500, 400],
  },
  {
    id: 'end',
    narration: 'Try it now. Paste any AI project URL. Get real feedback in 30 seconds. vibexforge.com.',
    subtitle: '',
    type: 'card',
  },
];

// ═══════════════════════════════════════════
// 2. Generate TTS for each scene
// ═══════════════════════════════════════════

console.log('▶ generating narration...');
const durations = {};

for (const scene of scenes) {
  const audioFile = path.join(TMP, 'audio', `${scene.id}.mp3`);
  execSync(
    `"${EDGE_TTS}" --voice "${VOICE}" --rate="-2%" --pitch="-2Hz" ` +
    `--text "${scene.narration.replace(/"/g, '\\"')}" ` +
    `--write-media "${audioFile}"`,
    { stdio: 'pipe' }
  );

  // Get duration from ffmpeg -i stderr
  const probe = execSync(
    `"${FFMPEG}" -i "${audioFile}" 2>&1 || true`,
    { encoding: 'utf-8' }
  );
  const durMatch = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (durMatch) {
    const secs = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
    durations[scene.id] = Math.max(secs, 2);
  } else {
    durations[scene.id] = 4;
  }

  console.log(`  ✓ ${scene.id}: ${durations[scene.id].toFixed(1)}s`);
}

// Add padding (1s breathing room per scene)
const sceneDurations = {};
for (const scene of scenes) {
  sceneDurations[scene.id] = durations[scene.id] + 1.2;
}

// ═══════════════════════════════════════════
// 3. Generate 8-bit ambient background (low drone)
// ═══════════════════════════════════════════

console.log('▶ generating ambient...');
const totalDuration = Object.values(sceneDurations).reduce((a, b) => a + b, 0);
const ambientFile = path.join(TMP, 'ambient.mp3');

// Square wave chord at very low volume — retro ambient
execSync(
  `"${FFMPEG}" -y -f lavfi -i "` +
  `anoisesrc=d=${totalDuration + 2}:c=pink:a=0.003,` +
  `highpass=f=200,lowpass=f=2000,` +
  `volume=0.15" ` +
  `-t ${totalDuration + 2} -ar 44100 "${ambientFile}"`,
  { stdio: 'pipe' }
);
console.log(`  ✓ ambient: ${totalDuration.toFixed(1)}s`);

// ═══════════════════════════════════════════
// 4. Generate title + end card images
// ═══════════════════════════════════════════

console.log('▶ generating cards...');
const browser = await chromium.launch({ headless: true });

async function renderCard(filename, html) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();
  await p.setContent(html);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(TMP, filename) });
  await ctx.close();
}

await renderCard('title-card.png', `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019,#1a0a3a 50%,#0d0019);
  font-family:monospace;">
  <div style="text-align:center">
    <div style="font-size:80px;font-weight:bold;letter-spacing:8px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(4px 4px 0 #000) drop-shadow(0 0 40px rgba(250,204,21,0.5));">
      VIBEX
    </div>
    <div style="margin-top:20px;font-size:16px;color:rgba(139,92,246,0.9);letter-spacing:4px;
      text-shadow:0 0 10px rgba(139,92,246,0.4);">
      YOUR AI LAUNCH REVIEWER
    </div>
  </div>
</body></html>
`);

await renderCard('end-card.png', `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019,#1a0a3a 50%,#0d0019);
  font-family:monospace;">
  <div style="text-align:center">
    <div style="font-size:56px;font-weight:bold;letter-spacing:5px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(3px 3px 0 #000) drop-shadow(0 0 25px rgba(250,204,21,0.4));">
      TRY IT NOW
    </div>
    <div style="margin-top:24px;font-size:24px;color:rgba(57,255,20,0.9);letter-spacing:3px;
      text-shadow:0 0 12px rgba(57,255,20,0.5);">
      vibexforge.com/launch
    </div>
    <div style="margin-top:14px;font-size:14px;color:rgba(232,232,236,0.5);letter-spacing:2px;">
      Paste any URL. 7 improvements. 30 seconds.
    </div>
    <div style="margin-top:32px;font-size:12px;color:rgba(250,204,21,0.4);letter-spacing:3px;">
      github.com/alex-jb/vibex
    </div>
  </div>
</body></html>
`);

// ═══════════════════════════════════════════
// 5. Record walkthrough (timed to narration)
// ═══════════════════════════════════════════

console.log('▶ recording walkthrough...');
const videoDir = path.join(TMP, 'video');
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: videoDir, size: { width: W, height: H } },
});
const page = await ctx.newPage();

// Inject demo chrome
async function inject() {
  await page.evaluate(() => {
    if (document.getElementById('_dc')) return;
    const s = document.createElement('style');
    s.id = '_dc';
    s.textContent = `
      @keyframes _rip { 0%{transform:scale(0);opacity:.7} 100%{transform:scale(2.5);opacity:0} }
      ._rip { position:fixed;pointer-events:none;z-index:99999;width:30px;height:30px;
        border-radius:50%;border:2px solid rgba(139,92,246,.8);
        background:rgba(139,92,246,.15);animation:_rip .5s ease-out forwards; }
      ._dot { position:fixed;pointer-events:none;z-index:99998;width:14px;height:14px;
        border-radius:50%;background:rgba(250,204,21,.9);
        box-shadow:0 0 10px rgba(250,204,21,.6),0 0 20px rgba(250,204,21,.2);
        transition:left .5s cubic-bezier(.25,.1,.25,1),top .5s cubic-bezier(.25,.1,.25,1);
        transform:translate(-50%,-50%); }
      ._sub { position:fixed;bottom:50px;left:50%;transform:translateX(-50%);z-index:99997;
        pointer-events:none;padding:10px 32px;border-radius:10px;
        background:rgba(0,0,0,.8);backdrop-filter:blur(12px);
        border:1px solid rgba(139,92,246,.25);
        font-family:'VT323',monospace;font-size:22px;color:rgba(232,232,236,.95);
        letter-spacing:1.5px;text-shadow:0 0 8px rgba(139,92,246,.4);
        opacity:0;transition:opacity .5s;white-space:nowrap; }
      ._sub.on { opacity:1; }
    `;
    document.head.appendChild(s);
    const d = document.createElement('div'); d.className='_dot'; d.id='_d';
    d.style.left='50%'; d.style.top='50%'; document.body.appendChild(d);
    const b = document.createElement('div'); b.className='_sub'; b.id='_s';
    document.body.appendChild(b);
    window._R = (x,y) => {
      const r = document.createElement('div'); r.className='_rip';
      r.style.left=(x-15)+'px'; r.style.top=(y-15)+'px';
      document.body.appendChild(r); setTimeout(()=>r.remove(),600);
    };
  });
}

async function moveTo(x, y) {
  await page.evaluate(({x,y}) => {
    const d = document.getElementById('_d');
    if(d){d.style.left=x+'px';d.style.top=y+'px';}
  }, {x,y});
  await page.waitForTimeout(500);
}

async function showSub(t) {
  await page.evaluate(t => {
    const s=document.getElementById('_s');
    if(s){s.textContent=t;s.classList.add('on');}
  }, t);
}

async function hideSub() {
  await page.evaluate(() => {
    const s=document.getElementById('_s');
    if(s) s.classList.remove('on');
  });
}

async function scroll(y, ms=1500) {
  await page.evaluate(({y,ms}) => {
    return new Promise(r=>{
      const s0=window.scrollY,d=y-s0,t0=performance.now();
      (function step(n){
        const t=Math.min(1,(n-t0)/ms),e=t*t*(3-2*t);
        window.scrollTo(0,s0+d*e);
        t<1?requestAnimationFrame(step):r();
      })(performance.now());
    });
  }, {y,ms});
}

// Record scenes matched to narration timing
for (const scene of scenes) {
  if (scene.type === 'card') {
    // Hold on blank during card scenes (cards composited later)
    if (scene.id === 'title') {
      // Navigate to landing but hold — title card overlaid in post
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(Math.round(sceneDurations.title * 1000));
    } else {
      // End card — hold on landing
      await page.waitForTimeout(Math.round(sceneDurations.end * 1000));
    }
    continue;
  }

  await page.goto(BASE + scene.url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await inject();

  if (scene.subtitle) await showSub(scene.subtitle);
  if (scene.cursorTarget) await moveTo(...scene.cursorTarget);

  // Main hold — synced to narration duration
  const holdMs = Math.round((sceneDurations[scene.id] - 2.5) * 1000);
  await page.waitForTimeout(Math.max(holdMs * 0.5, 500));

  if (scene.scrollTo) await scroll(scene.scrollTo, 1500);

  await page.waitForTimeout(Math.max(holdMs * 0.3, 400));

  if (scene.cursorTarget) {
    await page.evaluate(({x,y}) => window._R?.(x,y), {x: scene.cursorTarget[0], y: scene.cursorTarget[1]+100});
  }

  if (scene.extraPause) await page.waitForTimeout(scene.extraPause);

  await page.waitForTimeout(Math.max(holdMs * 0.2, 300));
  await hideSub();
  await page.waitForTimeout(300);
}

await page.close();
await ctx.close();
console.log('✓ walkthrough recorded');

// ═══════════════════════════════════════════
// 6. Compose everything with ffmpeg
// ═══════════════════════════════════════════

console.log('▶ composing final video...');

const webms = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
const walkSrc = path.join(videoDir, webms[0]);

// Walkthrough → mp4
const walkMp4 = path.join(TMP, 'walk.mp4');
execSync(`"${FFMPEG}" -y -i "${walkSrc}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -an "${walkMp4}"`, { stdio: 'pipe' });

// Title card video
const titleVid = path.join(TMP, 'title.mp4');
execSync(`"${FFMPEG}" -y -loop 1 -i "${path.join(TMP, 'title-card.png')}" -c:v libx264 -t ${sceneDurations.title.toFixed(1)} -pix_fmt yuv420p -vf "fps=25,fade=in:0:15,fade=out:st=${(sceneDurations.title - 0.5).toFixed(1)}:d=0.5" -preset fast "${titleVid}"`, { stdio: 'pipe' });

// End card video
const endVid = path.join(TMP, 'end.mp4');
execSync(`"${FFMPEG}" -y -loop 1 -i "${path.join(TMP, 'end-card.png')}" -c:v libx264 -t ${sceneDurations.end.toFixed(1)} -pix_fmt yuv420p -vf "fps=25,fade=in:0:15,fade=out:st=${(sceneDurations.end - 0.5).toFixed(1)}:d=0.5" -preset fast "${endVid}"`, { stdio: 'pipe' });

// Concat video: title + walk + end
const concatList = path.join(TMP, 'concat.txt');
fs.writeFileSync(concatList, `file '${titleVid}'\nfile '${walkMp4}'\nfile '${endVid}'\n`);
const videoOnly = path.join(TMP, 'video-only.mp4');
execSync(`"${FFMPEG}" -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${videoOnly}"`, { stdio: 'pipe' });

// Compose narration: concat all narration segments with gaps
let narrationFilter = '';
let narrationInputs = '';
let narrationMix = '';
let inputIdx = 0;
let timeOffset = 0;

for (const scene of scenes) {
  const audioFile = path.join(TMP, 'audio', `${scene.id}.mp3`);
  narrationInputs += `-i "${audioFile}" `;
  narrationMix += `[${inputIdx}]adelay=${Math.round(timeOffset * 1000)}|${Math.round(timeOffset * 1000)}[d${inputIdx}];`;
  timeOffset += sceneDurations[scene.id];
  inputIdx++;
}

// Mix all delayed narration tracks
const mixRefs = scenes.map((_, i) => `[d${i}]`).join('');
narrationFilter = narrationMix + `${mixRefs}amix=inputs=${scenes.length}:normalize=0[narr]`;

const narrationFile = path.join(TMP, 'narration.mp3');
execSync(
  `"${FFMPEG}" -y ${narrationInputs} -filter_complex "${narrationFilter}" -map "[narr]" -ar 44100 "${narrationFile}"`,
  { stdio: 'pipe' }
);

// Mix narration + ambient
const mixedAudio = path.join(TMP, 'mixed-audio.mp3');
execSync(
  `"${FFMPEG}" -y -i "${narrationFile}" -i "${ambientFile}" ` +
  `-filter_complex "[0:a]volume=1.0[n];[1:a]volume=0.12[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2" ` +
  `-ar 44100 "${mixedAudio}"`,
  { stdio: 'pipe' }
);

// Final: video + mixed audio
execSync(
  `"${FFMPEG}" -y -i "${videoOnly}" -i "${mixedAudio}" ` +
  `-c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "${OUT}"`,
  { stdio: 'pipe' }
);

console.log('✓ mp4:', OUT);

// Stats
const sz = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
const dur = execSync(`"${FFMPEG}" -i "${OUT}" 2>&1 | grep Duration | awk '{print $2}'`).toString().trim().replace(',', '');
console.log(`\nDone. ${sz}MB  duration=${dur}`);

// Cleanup
fs.rmSync(TMP, { recursive: true, force: true });
await browser.close();
