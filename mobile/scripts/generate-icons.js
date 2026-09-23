// scripts/generate-icons.js
// One-off script to regenerate assets/*.png from hand-authored SVGs using
// the app's actual brand palette (ink-navy + cream plate glyph), replacing
// the generic default Expo template icons. Run with: node scripts/generate-icons.js
const sharp = require("sharp");
const path = require("path");

const INK_NAVY = "#1E3A5F";
const CREAM = "#F6F3EA";
const TERRACOTTA = "#C96A43";

// A simple plate + fork + knife glyph, centered in a 1024x1024 viewBox.
function glyphSvg({ background = "none", fg = CREAM, accent = TERRACOTTA } = {}) {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${background !== "none" ? `<rect width="1024" height="1024" fill="${background}"/>` : ""}
  <circle cx="512" cy="512" r="230" fill="none" stroke="${fg}" stroke-width="34"/>
  <circle cx="512" cy="512" r="26" fill="${accent}"/>
  <g stroke="${fg}" stroke-width="26" stroke-linecap="round">
    <line x1="300" y1="360" x2="300" y2="664"/>
    <line x1="300" y1="360" x2="300" y2="430"/>
    <line x1="270" y1="360" x2="270" y2="430"/>
    <line x1="330" y1="360" x2="330" y2="430"/>
    <path d="M 724 360 C 700 400 700 440 724 470 L 724 664" fill="none"/>
  </g>
</svg>`.trim();
}

async function main() {
  const assets = path.join(__dirname, "..", "assets");

  // icon.png — full mark (background + glyph), used for iOS/web/legacy.
  await sharp(Buffer.from(glyphSvg({ background: INK_NAVY }))).resize(1024, 1024).png().toFile(path.join(assets, "icon.png"));

  // Android adaptive icon layers.
  await sharp(Buffer.from(`<svg width="1024" height="1024"><rect width="1024" height="1024" fill="${INK_NAVY}"/></svg>`))
    .png()
    .toFile(path.join(assets, "android-icon-background.png"));

  // Foreground glyph shrunk toward center so it survives the adaptive-icon mask crop.
  await sharp(Buffer.from(glyphSvg({ background: "none" })))
    .resize(680, 680)
    .extend({ top: 172, bottom: 172, left: 172, right: 172, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(assets, "android-icon-foreground.png"));

  await sharp(Buffer.from(glyphSvg({ background: "none", fg: "#FFFFFF", accent: "#FFFFFF" })))
    .resize(680, 680)
    .extend({ top: 172, bottom: 172, left: 172, right: 172, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(assets, "android-icon-monochrome.png"));

  // Splash icon: glyph only, transparent, composited over app.json's splash
  // background — a separate light/dark pair so the glyph stays visible
  // against both the cream light background and the ink-navy dark one.
  await sharp(Buffer.from(glyphSvg({ background: "none", fg: INK_NAVY })))
    .resize(400, 400)
    .png()
    .toFile(path.join(assets, "splash-icon.png"));
  await sharp(Buffer.from(glyphSvg({ background: "none" })))
    .resize(400, 400)
    .png()
    .toFile(path.join(assets, "splash-icon-dark.png"));

  // Favicon: small full mark.
  await sharp(Buffer.from(glyphSvg({ background: INK_NAVY }))).resize(196, 196).png().toFile(path.join(assets, "favicon.png"));

  console.log("Generated icons in", assets);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
