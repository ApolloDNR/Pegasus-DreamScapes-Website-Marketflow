#!/usr/bin/env node
// scripts/transcode-images.mjs
//
// Wave 4 — asset discipline. Produces AVIF + WebP siblings for the
// static photo surfaces that ship on the v1.0.1 public site:
//   - client/public/nelson/*.webp  → *.avif
//   - attached_assets/image_1778735694150.png (Apollo founder portrait)
//                                  → client/public/images/founder/apollo-{w}.{ext}
//
// AVIF/WebP are written next to (or beside) their source so the
// rendering layer can fall through `<picture>` sources cleanly.

import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "..");

async function transcodeNelson() {
  const dir = path.join(ROOT, "client/public/nelson");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".webp"));
  let made = 0;
  for (const f of files) {
    const src = path.join(dir, f);
    const dst = path.join(dir, f.replace(/\.webp$/, ".avif"));
    if (existsSync(dst)) continue;
    await sharp(src).avif({ quality: 55, effort: 4 }).toFile(dst);
    made += 1;
  }
  console.log(`nelson: ${made} AVIF siblings written (${files.length} sources)`);
}

async function transcodeFounder() {
  const src = path.join(ROOT, "attached_assets/image_1778735694150.png");
  if (!existsSync(src)) {
    console.warn(`founder source missing: ${src}`);
    return;
  }
  const outDir = path.join(ROOT, "client/public/images/founder");
  await mkdir(outDir, { recursive: true });
  const widths = [480, 768, 1200];
  for (const w of widths) {
    const base = path.join(outDir, `apollo-${w}`);
    if (!existsSync(`${base}.avif`)) {
      await sharp(src).resize({ width: w }).avif({ quality: 55, effort: 4 }).toFile(`${base}.avif`);
    }
    if (!existsSync(`${base}.webp`)) {
      await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(`${base}.webp`);
    }
    if (!existsSync(`${base}.jpg`)) {
      await sharp(src).resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`);
    }
  }
  console.log(`founder: AVIF + WebP + JPEG at ${widths.join(", ")}px written`);
}

await transcodeNelson();
await transcodeFounder();
console.log("done.");
