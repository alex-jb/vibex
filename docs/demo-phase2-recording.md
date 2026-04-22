# Demo Phase 2 — R1-R4 Product Recording

Swap static PNG screenshots for 4 short live-product clips, boosting the demo's "shipped, not mocked" signal. Phase 1 shipped with screenshots (see `public/demo-assets/0{3,4,5}-*.png`); Phase 2 replaces them with 6s MP4 clips.

## Shot list

| Clip | Scene that consumes it | URL | What happens | Duration |
|---|---|---|---|---|
| R1 | `ForgeAction.tsx:82` (`03-launch-filled.png`) | `/launch` | Form fills in (URL + title + description), scroll to Forge button | ~6s |
| R2 | `ReviewStream.tsx:114` (`04-project-forged.png`) first half | `/project/proj-mo1w2haf-ga3v?forged=1` | `?forged=1` triggers the forge-unveil animation — let it play | ~6s |
| R3 | `ReviewStream.tsx:114` second half | `/project/proj-mo1w2haf-ga3v` | Scroll to AI review panel, watch tokens stream in | ~6s |
| R4 | `EvolveRank.tsx:214` (`05-hunt.png`) | `/hunt` | Scroll through ranked projects, hover one card, maybe click upvote | ~6s |

## How to record

### Option A: autonomous (recommended)

```bash
npm install --no-save ffmpeg-static          # one-time
node scripts/record-r-clips.mjs              # all 4 clips → out/R{1,2,3,4}.mp4
node scripts/record-r-clips.mjs --only=R2    # re-record one
node scripts/record-r-clips.mjs --local      # if dev server + auth bypass
```

The script uses Playwright video-recording, outputs webm, then ffmpeg→mp4 at 1920×1080 H.264 CRF 18. Each clip takes ~8s wall time.

### Option B: manual screen capture

If the Playwright script can't hit the right states (e.g. auth-gated pages), use QuickTime screen recording:

1. Set Chrome viewport to exactly 1920×1080 (use devtools device mode → Custom)
2. QuickTime → New Screen Recording → select the Chrome tab area
3. Record the 4 flows above, each ~6s
4. Trim in QuickTime (`Cmd+T` to trim), save as `out/R1.mp4` … `out/R4.mp4`
5. Convert if needed: `ffmpeg -i input.mov -c:v libx264 -crf 18 out/R1.mp4`

## After recording

### 1. Upload to Blob

Extend `scripts/sync-demo-blob.mjs` with the 4 R-clips (or bolt on a quick one-liner):

```js
await put(`demo/${id}.mp4`, readFileSync(`out/${id}.mp4`), {
  access: "public", contentType: "video/mp4",
  addRandomSuffix: false, allowOverwrite: true, token,
});
```

They'll serve from `https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com/demo/R{1..4}.mp4`.

### 2. Swap the Remotion scenes

Each scene currently does `<Img src={staticFile("demo-assets/0N-*.png")} />`. Replace with:

```tsx
import { OffthreadVideo } from "remotion";

const R_BLOB = "https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com/demo";

<OffthreadVideo
  src={`${R_BLOB}/R1.mp4`}
  startFrom={0}
  // durationInFrames handled by parent Sequence
  style={{ /* same dimensions as the PNG it replaced */ }}
/>
```

The 3 consumer files (line numbers from current master):

- `remotion/src/scenes/demo/ForgeAction.tsx:82` — R1
- `remotion/src/scenes/demo/ReviewStream.tsx:114` — R2 (first 3s) + R3 (last 3s), or split into 2 Sequences
- `remotion/src/scenes/demo/EvolveRank.tsx:214` — R4

### 3. Re-render + re-upload the final demos

```bash
npm run remotion:demo && npm run remotion:demo-zh
npm run remotion:demo-vc && npm run remotion:demo-vc-zh
npm run demo:sync-blob                       # pushes new MP4s to Blob
```

The `/investors` page picks up the new `vibex-demo-vc-v1.mp4` on next request (30d cache can be busted by adding `?v=2` or purging Blob entry).

## Why Phase 2 matters

GEO scorecard hit ceiling on "brand authority" (see `memory/vibex_geo_scorecard.md`). Distribution is the lever, and a live-product demo is significantly more credible than screenshots for the `vc-cold-email` / `hacker-news` / `product-hunt` channels in `~/Desktop/vibexmarketing/04-distribution/`.

Estimated impact: ~5-10 point boost on "shipped code" perception across all pitch channels. Effort: 15 min recording + 30 min Remotion scene swap + re-render.
