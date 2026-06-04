import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIRS = [
  path.resolve("client/public/og"),
  path.resolve("public/og"),
];

const NAVY = "#0D1B2D";
const CHARCOAL = "#1E2328";
const CREAM = "#F6EFE4";
const COPPER = "#C77A3A";

const cards = [
  {
    slug: "default",
    kicker: "Pegasus Dreamscapes - The Deal Architect",
    h1: "Complex property.",
    h2: "Structured opportunity.",
    sub: "A strategy-first real estate operating company. We review the situation, then design the path.",
  },
  {
    slug: "home",
    kicker: "Pegasus Dreamscapes - The Deal Architect",
    h1: "Complex property.",
    h2: "Structured opportunity.",
    sub: "Bring us the property. We'll show you the path.",
  },
  {
    slug: "about",
    kicker: "About - Pegasus Dreamscapes",
    h1: "Built on strategy.",
    h2: "Governed by virtue.",
    sub: "Founded by Apollo Duran. DRE #02333658 - KW East Bay.",
  },
  {
    slug: "strategy-lab",
    kicker: "Strategy Lab - Pegasus Dreamscapes",
    h1: "Run the numbers.",
    h2: "See the path.",
    sub: "Quick Read and Full Path underwriting for complex East Bay real estate.",
  },
  {
    slug: "projects",
    kicker: "The Record - Pegasus Dreamscapes",
    h1: "Documented projects.",
    h2: "Honest economics.",
    sub: "Every project, every lesson. No fluff, no fabricated returns.",
  },
  {
    slug: "nelson-dr",
    kicker: "Case Study - Pegasus Dreamscapes",
    h1: "Nelson Dr.",
    h2: "Where the doctrine was forged.",
    sub: "A complex East Bay value-add. Permit-aware underwriting, disciplined renovation, retail exit.",
  },
  {
    slug: "marketflow",
    kicker: "MarketFlow - Pegasus Dreamscapes",
    h1: "Private dealflow.",
    h2: "For a vetted network.",
    sub: "Off-market opportunities, structured offers, disciplined execution. Request beta access.",
  },
  {
    slug: "capital",
    kicker: "Capital - Pegasus Dreamscapes",
    h1: "Conversations,",
    h2: "not pitches.",
    sub: "Private, individual, and on the record. Written agreement on every deal.",
  },
  {
    slug: "submit",
    kicker: "Submit a Property - Pegasus Dreamscapes",
    h1: "Bring us the property.",
    h2: "We'll show you the path.",
    sub: "Every property gets a path. Not every property gets an offer. Most reviewed within 5 business days.",
  },
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function svgFor({ kicker, h1, h2, sub }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${CHARCOAL}"/>
    </linearGradient>
    <linearGradient id="copperline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${COPPER}" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="${COPPER}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${COPPER}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="160" r="260" fill="${COPPER}" opacity="0.10"/>
  <circle cx="180" cy="540" r="200" fill="${COPPER}" opacity="0.07"/>
  <rect x="80" y="148" width="44" height="2" fill="${COPPER}"/>
  <text x="138" y="156" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="5" fill="${COPPER}">${escapeXml(kicker.toUpperCase())}</text>
  <text x="80" y="296" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" fill="${CREAM}">${escapeXml(h1)}</text>
  <text x="80" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="500" font-style="italic" fill="${COPPER}">${escapeXml(h2)}</text>
  <text x="80" y="472" font-family="'Helvetica Neue', Arial, sans-serif" font-size="26" font-weight="400" fill="${CREAM}" opacity="0.88">${escapeXml(sub)}</text>
  <rect x="80" y="548" width="1040" height="3" fill="url(#copperline)"/>
  <text x="80" y="592" font-family="Georgia, 'Times New Roman', serif" font-size="16" letter-spacing="5" fill="${COPPER}">DREAM IT - BUILD IT - LIVE IT</text>
  <text x="1120" y="592" text-anchor="end" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" letter-spacing="3" fill="${CREAM}" opacity="0.6">pegasusdreamscapes.com</text>
</svg>`;
}

async function main() {
  for (const dir of OUT_DIRS) {
    await mkdir(dir, { recursive: true });
  }
  for (const card of cards) {
    const svg = svgFor(card);
    const png = await sharp(Buffer.from(svg)).png({ quality: 92 }).toBuffer();
    for (const dir of OUT_DIRS) {
      const out = path.join(dir, `${card.slug}.png`);
      await sharp(png).toFile(out);
      console.log(`wrote ${out}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
