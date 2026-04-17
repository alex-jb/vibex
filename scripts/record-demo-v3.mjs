// V3 demo recorder — per-scene recording for perfect audio-video sync.
//
// Architecture:
//   1. Generate TTS narration per scene → get exact duration
//   2. Record EACH scene as a separate Playwright video clip, holding
//      exactly (narration_duration + padding) seconds
//   3. Merge each clip's video + audio → scene_N.mp4
//   4. Generate title + end card mp4s
//   5. Concat all with crossfade transitions
//   6. Mix in ambient background
//
// This guarantees narration lines up with what's on screen because
// each clip is exactly as long as its audio.
//
// Prereqs: npm install --no-save ffmpeg-static && pip3 install edge-tts

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const FFMPEG = (await import('ffmpeg-static')).default;
const EDGE_TTS = path.join(homedir(), 'Library/Python/3.9/bin/edge-tts');
const DESKTOP = path.join(homedir(), 'Desktop');
const TMP = path.join(DESKTOP, '_vibex_v3_tmp');
const OUT_MP4 = path.join(DESKTOP, 'vibex-demo-v3.mp4');
const BASE = 'https://www.vibexforge.com';
const W = 1280, H = 720;
const VOICE = 'en-US-AndrewNeural';

fs.mkdirSync(path.join(TMP, 'audio'), { recursive: true });
fs.mkdirSync(path.join(TMP, 'clips'), { recursive: true });

// ═══════════════════════════════════════════
// Scene definitions
// ═══════════════════════════════════════════

const scenes = [
  {
    id: '01-title', type: 'card',
    narration: 'VibeX. Your AI project\'s launch page, reviewed by Claude in thirty seconds.',
  },
  {
    id: '02-landing', url: '/',
    narration: 'Every session starts at the portal. One click to forge your project.',
    subtitle: '▸ The Portal',
    scrollTo: 400, cursor: [640, 380],
  },
  {
    id: '03-hq', url: '/home',
    narration: 'Your headquarters. All your projects, today\'s leaderboard, and your next move.',
    subtitle: '▸ HQ — dashboard',
    scrollTo: 500, cursor: [400, 320],
  },
  {
    id: '04-hunt', url: '/hunt',
    narration: 'The Hunt. Real-time rankings powered by Supabase. Updated live as creators ship.',
    subtitle: '▸ Hunt — live rankings',
    scrollTo: 400, cursor: [500, 300],
  },
  {
    id: '05-project', url: '/project/2',
    narration: 'Every project gets a Claude review. Five to seven concrete actions you can apply with one click.',
    subtitle: '▸ AgentForge — Claude reviewed → 7 actions',
    scrollTo: 600, cursor: [600, 250],
  },
  {
    id: '06-ideas', url: '/ideas',
    narration: 'The Idea Lab. Score your concept with AI before you write a single line of code.',
    subtitle: '▸ Idea Lab — score first',
    scrollTo: 500, cursor: [700, 350],
  },
  {
    id: '07-creators', url: '/creators',
    narration: 'And the creators who built it all. Ranked by what they shipped, not what they promised.',
    subtitle: '▸ Creators',
    scrollTo: 300, cursor: [500, 400],
  },
  {
    id: '08-end', type: 'card',
    narration: 'Try it now. Paste any AI project URL and get real feedback in thirty seconds. vibexforge dot com.',
  },
];

// ═══════════════════════════════════════════
// Step 1: Generate narration + measure durations
// ═══════════════════════════════════════════

console.log('▶ Step 1: generating narration...');
for (const s of scenes) {
  const audioFile = path.join(TMP, 'audio', `${s.id}.mp3`);
  execSync(
    `"${EDGE_TTS}" --voice "${VOICE}" --rate="-5%" --pitch="-3Hz" ` +
    `--text "${s.narration.replace(/"/g, '\\"')}" ` +
    `--write-media "${audioFile}"`,
    { stdio: 'pipe' }
  );
  const probe = execSync(`"${FFMPEG}" -i "${audioFile}" 2>&1 || true`, { encoding: 'utf-8' });
  const m = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  s.audioDur = m ? parseInt(m[1])*3600 + parseInt(m[2])*60 + parseFloat(m[3]) : 4;
  s.clipDur = s.audioDur + 1.5; // 1.5s breathing room
  console.log(`  ✓ ${s.id}: narr=${s.audioDur.toFixed(1)}s clip=${s.clipDur.toFixed(1)}s`);
}

// ═══════════════════════════════════════════
// Step 2: Generate card images
// ═══════════════════════════════════════════

console.log('▶ Step 2: generating cards...');
const browser = await chromium.launch({ headless: true });

async function renderCard(name, html) {
  const c = await browser.newContext({ viewport: { width: W, height: H } });
  const p = await c.newPage();
  await p.setContent(html);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(TMP, `${name}.png`) });
  await c.close();
}

await renderCard('title-card', `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019 0%,#1a0a3a 40%,#0d0019 100%);
  font-family:monospace;overflow:hidden;">
  <div style="text-align:center">
    <div style="font-size:88px;font-weight:900;letter-spacing:10px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(4px 4px 0 #000) drop-shadow(0 0 50px rgba(250,204,21,0.5));">
      VIBEX
    </div>
    <div style="margin-top:24px;font-size:17px;color:rgba(139,92,246,0.9);letter-spacing:5px;
      text-shadow:0 0 12px rgba(139,92,246,0.5);">
      YOUR AI LAUNCH REVIEWER
    </div>
    <div style="margin-top:40px;font-size:13px;color:rgba(232,232,236,0.35);letter-spacing:3px;">
      vibexforge.com
    </div>
  </div>
</body></html>`);

await renderCard('end-card', `
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${W}px;height:${H}px;background:linear-gradient(135deg,#0d0019 0%,#1a0a3a 40%,#0d0019 100%);
  font-family:monospace;overflow:hidden;">
  <div style="text-align:center">
    <div style="font-size:60px;font-weight:900;letter-spacing:6px;
      background:linear-gradient(180deg,#FFE27D,#FFD700 40%,#B8860B);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(3px 3px 0 #000) drop-shadow(0 0 30px rgba(250,204,21,0.4));">
      TRY IT NOW
    </div>
    <div style="margin-top:28px;font-size:26px;color:rgba(57,255,20,0.9);letter-spacing:3px;
      text-shadow:0 0 14px rgba(57,255,20,0.5);">
      vibexforge.com/launch
    </div>
    <div style="margin-top:16px;font-size:15px;color:rgba(232,232,236,0.5);letter-spacing:2px;">
      Paste any URL. 7 improvements. 30 seconds.
    </div>
    <div style="margin-top:36px;font-size:12px;color:rgba(250,204,21,0.4);letter-spacing:4px;">
      ⭐ github.com/alex-jb/vibex
    </div>
  </div>
</body></html>`);

// ═══════════════════════════════════════════
// Step 3: Record each scene as SEPARATE clip
// ═══════════════════════════════════════════

console.log('▶ Step 3: recording per-scene clips...');

const CHROME_CSS = `
@keyframes _rip{0%{transform:scale(0);opacity:.7}100%{transform:scale(2.5);opacity:0}}
._rip{position:fixed;pointer-events:none;z-index:99999;width:30px;height:30px;
  border-radius:50%;border:2px solid rgba(139,92,246,.8);
  background:rgba(139,92,246,.15);animation:_rip .5s ease-out forwards}
._dot{position:fixed;pointer-events:none;z-index:99998;width:14px;height:14px;
  border-radius:50%;background:rgba(250,204,21,.9);
  box-shadow:0 0 10px rgba(250,204,21,.6),0 0 22px rgba(250,204,21,.2);
  transition:left .6s cubic-bezier(.25,.1,.25,1),top .6s cubic-bezier(.25,.1,.25,1);
  transform:translate(-50%,-50%)}
._sub{position:fixed;bottom:48px;left:50%;transform:translateX(-50%);z-index:99997;
  pointer-events:none;padding:10px 36px;border-radius:12px;
  background:rgba(0,0,0,.82);backdrop-filter:blur(14px);
  border:1px solid rgba(139,92,246,.2);
  font-family:'VT323',monospace;font-size:22px;color:rgba(232,232,236,.95);
  letter-spacing:1.5px;text-shadow:0 0 8px rgba(139,92,246,.4);
  opacity:0;transition:opacity .5s;white-space:nowrap}
._sub.on{opacity:1}
`;

for (const s of scenes) {
  if (s.type === 'card') {
    // Card scenes: convert static image to video clip
    const cardImg = path.join(TMP, s.id === '01-title' ? 'title-card.png' : 'end-card.png');
    const clipFile = path.join(TMP, 'clips', `${s.id}.mp4`);
    const fadeDur = 0.6;
    execSync(
      `"${FFMPEG}" -y -loop 1 -i "${cardImg}" -c:v libx264 -t ${s.clipDur.toFixed(2)} ` +
      `-pix_fmt yuv420p -vf "fps=25,fade=in:0:${Math.round(fadeDur*25)},` +
      `fade=out:st=${(s.clipDur - fadeDur).toFixed(2)}:d=${fadeDur}" ` +
      `-preset fast "${clipFile}"`,
      { stdio: 'pipe' }
    );
    console.log(`  ✓ ${s.id} (card): ${s.clipDur.toFixed(1)}s`);
    continue;
  }

  // Live scene: new browser context → record → close
  const sceneVideoDir = path.join(TMP, 'clips', `${s.id}_raw`);
  fs.mkdirSync(sceneVideoDir, { recursive: true });

  const sceneCtx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: sceneVideoDir, size: { width: W, height: H } },
  });
  const pg = await sceneCtx.newPage();

  // Navigate + wait for content
  await pg.goto(BASE + s.url, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(1200);

  // Inject chrome
  await pg.evaluate((css) => {
    const st = document.createElement('style'); st.textContent = css;
    document.head.appendChild(st);
    const d = document.createElement('div'); d.className='_dot'; d.id='_d';
    d.style.left='50%'; d.style.top='50%'; document.body.appendChild(d);
    const b = document.createElement('div'); b.className='_sub'; b.id='_s';
    document.body.appendChild(b);
    window._R=(x,y)=>{const r=document.createElement('div');r.className='_rip';
      r.style.left=(x-15)+'px';r.style.top=(y-15)+'px';
      document.body.appendChild(r);setTimeout(()=>r.remove(),600)};
  }, CHROME_CSS);

  // Show subtitle
  if (s.subtitle) {
    await pg.evaluate(t => {
      const el = document.getElementById('_s');
      if(el){el.textContent=t;el.classList.add('on');}
    }, s.subtitle);
  }

  // Move cursor
  if (s.cursor) {
    await pg.evaluate(({x,y}) => {
      const d=document.getElementById('_d');
      if(d){d.style.left=x+'px';d.style.top=y+'px';}
    }, {x: s.cursor[0], y: s.cursor[1]});
  }

  // Hold for narration + scroll midway
  const holdMs = Math.round(s.clipDur * 1000);
  const scrollAt = Math.round(holdMs * 0.4);
  const remainAfterScroll = holdMs - scrollAt - 1500;

  await pg.waitForTimeout(scrollAt);

  if (s.scrollTo) {
    await pg.evaluate(({y,ms}) => {
      return new Promise(r=>{
        const s0=window.scrollY,d=y-s0,t0=performance.now();
        (function step(n){
          const t=Math.min(1,(n-t0)/ms),e=t*t*(3-2*t);
          window.scrollTo(0,s0+d*e);
          t<1?requestAnimationFrame(step):r();
        })(performance.now());
      });
    }, {y: s.scrollTo, ms: 1500});
  }

  // Click ripple at cursor position
  if (s.cursor) {
    await pg.evaluate(({x,y}) => window._R?.(x,y+80), {x: s.cursor[0], y: s.cursor[1]});
  }

  await pg.waitForTimeout(Math.max(remainAfterScroll, 500));

  // Hide subtitle before scene ends
  await pg.evaluate(() => {
    const el = document.getElementById('_s');
    if(el) el.classList.remove('on');
  });
  await pg.waitForTimeout(400);

  // Close context → finalize video
  await pg.close();
  await sceneCtx.close();

  // Find the webm
  const webms = fs.readdirSync(sceneVideoDir).filter(f => f.endsWith('.webm'));
  const rawWebm = path.join(sceneVideoDir, webms[0]);

  // Trim to exact clipDur and convert to mp4
  const clipFile = path.join(TMP, 'clips', `${s.id}.mp4`);
  execSync(
    `"${FFMPEG}" -y -i "${rawWebm}" -t ${s.clipDur.toFixed(2)} ` +
    `-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an "${clipFile}"`,
    { stdio: 'pipe' }
  );

  console.log(`  ✓ ${s.id}: ${s.clipDur.toFixed(1)}s`);
}

// ═══════════════════════════════════════════
// Step 4: Merge each clip with its narration
// ═══════════════════════════════════════════

console.log('▶ Step 4: merging video + narration per scene...');

for (const s of scenes) {
  const clipFile = path.join(TMP, 'clips', `${s.id}.mp4`);
  const audioFile = path.join(TMP, 'audio', `${s.id}.mp3`);
  const mergedFile = path.join(TMP, 'clips', `${s.id}-merged.mp4`);

  // Merge: video + narration (audio starts 0.3s in for natural feel)
  execSync(
    `"${FFMPEG}" -y -i "${clipFile}" -i "${audioFile}" ` +
    `-filter_complex "[1:a]adelay=300|300,apad[a]" ` +
    `-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 128k ` +
    `-shortest "${mergedFile}"`,
    { stdio: 'pipe' }
  );
}
console.log('  ✓ all scenes merged');

// ═══════════════════════════════════════════
// Step 5: Generate ambient + concat
// ═══════════════════════════════════════════

console.log('▶ Step 5: final composition...');

const totalDur = scenes.reduce((a, s) => a + s.clipDur, 0);

// Ambient: soft pink noise, very low volume
const ambientFile = path.join(TMP, 'ambient.mp3');
execSync(
  `"${FFMPEG}" -y -f lavfi -i "anoisesrc=d=${totalDur + 2}:c=pink:a=0.002,` +
  `highpass=f=300,lowpass=f=1800,volume=0.1" -t ${totalDur + 2} -ar 44100 "${ambientFile}"`,
  { stdio: 'pipe' }
);

// Concat list
const concatList = path.join(TMP, 'concat.txt');
const concatEntries = scenes.map(s =>
  `file '${path.join(TMP, 'clips', `${s.id}-merged.mp4`)}'`
).join('\n');
fs.writeFileSync(concatList, concatEntries);

// Concat all scenes
const concatted = path.join(TMP, 'concatted.mp4');
execSync(
  `"${FFMPEG}" -y -f concat -safe 0 -i "${concatList}" ` +
  `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 128k "${concatted}"`,
  { stdio: 'pipe' }
);

// Mix in ambient at low volume
execSync(
  `"${FFMPEG}" -y -i "${concatted}" -i "${ambientFile}" ` +
  `-filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2" ` +
  `-c:v copy -c:a aac -b:a 128k -movflags +faststart "${OUT_MP4}"`,
  { stdio: 'pipe' }
);

console.log('✓', OUT_MP4);

// Stats
const sz = (fs.statSync(OUT_MP4).size / 1024 / 1024).toFixed(1);
const dur = execSync(`"${FFMPEG}" -i "${OUT_MP4}" 2>&1 | grep Duration | awk '{print $2}'`)
  .toString().trim().replace(',', '');
console.log(`\nDone. ${sz}MB  duration=${dur}`);

// Cleanup
fs.rmSync(TMP, { recursive: true, force: true });
await browser.close();
