#!/usr/bin/env node
/**
 * gen.mjs — Gemini 2.5 Flash Image ("nanobanana") helper.
 *
 * Usage:
 *   node scripts/gen.mjs "prompt text" --out public/generated/foo.png
 *   node scripts/gen.mjs "prompt" --out bar.png --aspect 16:9
 *   node scripts/gen.mjs "prompt" --out foo.png --ref path/to/ref.png
 *
 * Flags:
 *   --out <path>    Where to write the PNG (required)
 *   --aspect <w:h>  Aspect ratio hint appended to the prompt (optional)
 *   --ref <path>    Reference image for image-to-image style match (optional)
 *   --model <id>    Override model (default gemini-2.5-flash-image)
 *
 * Reads GOOGLE_GENAI_API_KEY from .env.local or process env.
 *
 * Exit codes: 0 success, 1 validation error, 2 API error.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Modality } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// ─── Load .env.local manually so we don't pull in a dotenv dep ───
function loadEnv() {
  const envPath = path.join(repoRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]]) continue; // don't clobber real env
    let value = m[2];
    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[m[1]] = value;
  }
}
loadEnv();

// ─── Parse argv ───
function parseArgs(argv) {
  const args = { prompt: "", out: "", aspect: "", ref: "", model: "gemini-2.5-flash-image" };
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--aspect") args.aspect = argv[++i];
    else if (a === "--ref") args.ref = argv[++i];
    else if (a === "--model") args.model = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`Unknown flag: ${a}`);
      process.exit(1);
    } else positional.push(a);
  }
  args.prompt = positional.join(" ");
  return args;
}

const args = parseArgs(process.argv);

if (!args.prompt) {
  console.error('Usage: node scripts/gen.mjs "prompt" --out path/to/out.png');
  process.exit(1);
}
if (!args.out) {
  console.error("Missing --out <path>");
  process.exit(1);
}

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.error(
    "GOOGLE_GENAI_API_KEY not set. Add it to .env.local or export it before running.",
  );
  process.exit(1);
}

// ─── Build final prompt ───
let finalPrompt = args.prompt;
if (args.aspect) {
  finalPrompt += ` — aspect ratio ${args.aspect}`;
}

// ─── Build contents (text + optional reference image) ───
const parts = [{ text: finalPrompt }];
if (args.ref) {
  if (!fs.existsSync(args.ref)) {
    console.error(`Reference image not found: ${args.ref}`);
    process.exit(1);
  }
  const refBytes = fs.readFileSync(args.ref);
  const refExt = path.extname(args.ref).slice(1).toLowerCase() || "png";
  const mimeType = refExt === "jpg" ? "image/jpeg" : `image/${refExt}`;
  parts.push({
    inlineData: {
      data: refBytes.toString("base64"),
      mimeType,
    },
  });
}

// ─── Call the API ───
const ai = new GoogleGenAI({ apiKey });

console.log(`▸ model: ${args.model}`);
console.log(`▸ prompt: ${finalPrompt}`);
if (args.ref) console.log(`▸ reference: ${args.ref}`);
console.log(`▸ out: ${args.out}`);
console.log("▸ generating…");

const start = Date.now();
let response;
try {
  response = await ai.models.generateContent({
    model: args.model,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
} catch (err) {
  console.error("API error:", err?.message ?? err);
  process.exit(2);
}

// ─── Extract the first inlineData part ───
const candidateParts = response?.candidates?.[0]?.content?.parts ?? [];
const imagePart = candidateParts.find((p) => p?.inlineData?.data);
if (!imagePart) {
  console.error("No image returned. Full response:");
  console.error(JSON.stringify(response, null, 2).slice(0, 2000));
  process.exit(2);
}

const imageBytes = Buffer.from(imagePart.inlineData.data, "base64");
const outPath = path.isAbsolute(args.out)
  ? args.out
  : path.join(repoRoot, args.out);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, imageBytes);

const ms = Date.now() - start;
const kb = (imageBytes.length / 1024).toFixed(1);
console.log(`✓ wrote ${outPath} (${kb} KB, ${ms} ms)`);

// Surface any text parts the model returned (e.g. safety notes, captions).
const textParts = candidateParts
  .filter((p) => p?.text)
  .map((p) => p.text.trim())
  .filter(Boolean);
if (textParts.length) {
  console.log(`▸ model said: ${textParts.join(" ").slice(0, 300)}`);
}
