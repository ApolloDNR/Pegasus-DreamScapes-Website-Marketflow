import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = "attached_assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";
const OUT_DIR = "client/public/images/hero";
const OG_DIR = "client/public/og";
const OG_SRC = "client/public/og-image.png";

const WIDTHS = [768, 1280, 1920];

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function buildHero() {
  await ensureDir(OUT_DIR);
  const meta = await sharp(SRC).metadata();
  console.log(`Source ${SRC}: ${meta.width}x${meta.height}`);
  for (const w of WIDTHS) {
    const base = path.join(OUT_DIR, `luxury-home-${w}`);
    await sharp(SRC).resize({ width: w }).avif({ quality: 55 }).toFile(`${base}.avif`);
    await sharp(SRC).resize({ width: w }).webp({ quality: 78 }).toFile(`${base}.webp`);
    await sharp(SRC).resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`);
    console.log(`  built ${w}w (avif/webp/jpg)`);
  }
  // LQIP base64 (16px wide blurred)
  const lqipBuf = await sharp(SRC).resize({ width: 24 }).blur(2).webp({ quality: 40 }).toBuffer();
  console.log(`LQIP base64 (${lqipBuf.length}b): data:image/webp;base64,${lqipBuf.toString("base64")}`);
}

async function buildOg() {
  await ensureDir(OG_DIR);
  if (!existsSync(OG_SRC)) {
    console.log("No og-image.png found in client/public/, skipping og resize");
    return;
  }
  await sharp(OG_SRC).resize({ width: 1200, height: 630, fit: "cover" }).png({ quality: 90 }).toFile(path.join(OG_DIR, "default.png"));
  await sharp(OG_SRC).resize({ width: 1200, height: 630, fit: "cover" }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OG_DIR, "default.jpg"));
  console.log("OG default 1200x630 written to client/public/og/");
}

await buildHero();
await buildOg();
console.log("Done.");
