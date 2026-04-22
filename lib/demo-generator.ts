import { chromium, type Browser } from "playwright-core";
import GIFEncoder from "gif-encoder-2";
import { PNG } from "pngjs";

/**
 * Generate a GIF demo from a URL by auto-scrolling and capturing frames.
 *
 * Flow: Launch browser → visit URL → screenshot at scroll positions → encode GIF
 *
 * @param url - The URL to capture
 * @param options - Configuration
 * @returns GIF buffer
 */
export async function generateDemoGif(
  url: string,
  options: {
    width?: number;
    height?: number;
    frameDelay?: number;
    quality?: number;
    maxFrames?: number;
  } = {}
): Promise<{ buffer: Buffer; frames: number; sizeKB: number }> {
  const {
    width = 1280,
    height = 720,
    frameDelay = 800,
    quality = 10,
    maxFrames = 6,
  } = options;

  let browser: Browser | null = null;

  try {
    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage({
      viewport: { width, height },
    });

    // Navigate and wait for page to load
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 20000,
    });

    // Small delay for animations/renders to settle
    await page.waitForTimeout(1000);

    // Capture frames at different scroll positions
    const frames: Buffer[] = [];

    // Frame 1: Top of page (hero/header)
    frames.push(await page.screenshot({ type: "png" }));

    // Get page height for scroll calculations
    const scrollHeight = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );

    if (scrollHeight > 100) {
      // Frame 2-5: Scroll through page
      const scrollSteps = Math.min(maxFrames - 1, 4);
      for (let i = 1; i <= scrollSteps; i++) {
        const scrollTo = Math.round((scrollHeight * i) / scrollSteps);
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollTo);
        await page.waitForTimeout(300); // Wait for scroll + lazy-loaded content
        frames.push(await page.screenshot({ type: "png" }));
      }
    }

    // Optional: Try to hover over a prominent button for visual feedback
    try {
      const button = await page.$("button, a.btn, [role='button']");
      if (button && frames.length < maxFrames) {
        await button.hover();
        await page.waitForTimeout(300);
        frames.push(await page.screenshot({ type: "png" }));
      }
    } catch {
      // Non-critical — skip hover frame
    }

    // Encode frames to GIF
    const gifBuffer = await encodeGif(frames, width, height, frameDelay, quality);

    return {
      buffer: gifBuffer,
      frames: frames.length,
      sizeKB: Math.round(gifBuffer.length / 1024),
    };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Encode PNG screenshot buffers into an animated GIF.
 */
async function encodeGif(
  pngBuffers: Buffer[],
  width: number,
  height: number,
  delay: number,
  quality: number
): Promise<Buffer> {
  const encoder = new GIFEncoder(width, height, "neuquant", true);
  encoder.setDelay(delay);
  encoder.setQuality(quality);
  encoder.setRepeat(0); // 0 = loop forever

  encoder.start();

  for (const pngBuf of pngBuffers) {
    const png = PNG.sync.read(pngBuf);
    // GIFEncoder expects raw RGBA pixel data
    encoder.addFrame(png.data as unknown as Uint8ClampedArray);
  }

  encoder.finish();

  // Collect all chunks into a single buffer
  const chunks: Buffer[] = [];
  const readable = encoder.createReadStream?.();
  if (readable) {
    for await (const chunk of readable) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Fallback: read from out property
  return encoder.out?.getData?.() ?? Buffer.alloc(0);
}

/**
 * Validate URL before attempting capture.
 */
export function isValidDemoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
