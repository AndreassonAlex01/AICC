// scripts/generate-store-assets.js
// Renders the Google Play listing graphics into store-assets/:
//   play-icon-512.png            — the 512x512 hi-res icon
//   feature-graphic-1024x500.png — the 1024x500 feature graphic
// Run with: node scripts/generate-store-assets.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const CREAM = "#F6F3EA";
const TERRACOTTA = "#C96A43";

// Same plate + fork + knife glyph as scripts/generate-icons.js (1024 space).
const GLYPH = `
  <circle cx="512" cy="512" r="230" fill="none" stroke="${CREAM}" stroke-width="34"/>
  <circle cx="512" cy="512" r="26" fill="${TERRACOTTA}"/>
  <g stroke="${CREAM}" stroke-width="26" stroke-linecap="round">
    <line x1="300" y1="360" x2="300" y2="664"/>
    <line x1="300" y1="360" x2="300" y2="430"/>
    <line x1="270" y1="360" x2="270" y2="430"/>
    <line x1="330" y1="360" x2="330" y2="430"/>
    <path d="M 724 360 C 700 400 700 440 724 470 L 724 664" fill="none"/>
  </g>`;

const SCALE = 0.6;
const CENTER = { x: 250, y: 250 };

const FEATURE_GRAPHIC = `
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#24487A"/>
      <stop offset="1" stop-color="#16294A"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(${CENTER.x - 512 * SCALE} ${CENTER.y - 512 * SCALE}) scale(${SCALE})">${GLYPH}</g>
  <text x="470" y="265" font-family="Arial, Helvetica, sans-serif" font-size="150" font-weight="700" fill="${CREAM}">AICC</text>
  <rect x="474" y="292" width="120" height="8" rx="4" fill="${TERRACOTTA}"/>
  <text x="472" y="360" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#C9D3E3">Snap a meal. Get your macros.</text>
</svg>`;

async function main() {
  const root = path.join(__dirname, "..");
  const out = path.join(root, "store-assets");
  fs.mkdirSync(out, { recursive: true });

  await sharp(path.join(root, "assets", "icon.png"))
    .resize(512, 512)
    .ensureAlpha()
    .png()
    .toFile(path.join(out, "play-icon-512.png"));

  await sharp(Buffer.from(FEATURE_GRAPHIC)).png().toFile(path.join(out, "feature-graphic-1024x500.png"));

  console.log("Generated store assets in", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
