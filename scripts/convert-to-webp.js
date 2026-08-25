const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

const IMAGES_TO_CONVERT = [
  // Full-page backgrounds / Artboards (Quality 88: pristine visual clarity & crisp text)
  { src: "Artboard1.jpg", dest: "Artboard1.webp", quality: 88, lossless: false },
  { src: "Artboard 2.jpg", dest: "Artboard 2.webp", quality: 88, lossless: false },
  { src: "Artboard 3.jpg", dest: "Artboard 3.webp", quality: 88, lossless: false },
  { src: "Artboard 4.jpg", dest: "Artboard 4.webp", quality: 88, lossless: false },
  { src: "Artboard 5.jpg", dest: "Artboard 5.webp", quality: 88, lossless: false },
  { src: "newBg.jpg", dest: "newBg.webp", quality: 88, lossless: false },
  { src: "proposal-contact.jpg", dest: "proposal-contact.webp", quality: 88, lossless: false },
  
  // UI & Illustration Assets (Lossless or High Quality with full alpha support)
  { src: "about-HT.png", dest: "about-HT.webp", quality: 90, lossless: false },
  { src: "IMG_0751-1.png", dest: "IMG_0751-1.webp", quality: 90, lossless: false },
  { src: "download.jpg", dest: "download.webp", quality: 90, lossless: false },
  { src: "header.png", dest: "header.webp", quality: 95, lossless: false },
  { src: "footer.png", dest: "footer.webp", quality: 95, lossless: false },
  { src: "ht-logo.png", dest: "ht-logo.webp", quality: 95, lossless: false },
  { src: "ht-logo-cropped.png", dest: "ht-logo-cropped.webp", quality: 95, lossless: false },
];

async function convertAll() {
  console.log("🚀 Starting WebP conversion...\n");

  let totalOriginal = 0;
  let totalConverted = 0;

  for (const img of IMAGES_TO_CONVERT) {
    const srcPath = path.join(PUBLIC_DIR, img.src);
    const destPath = path.join(PUBLIC_DIR, img.dest);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️ Source file not found: ${img.src}`);
      continue;
    }

    const origStats = fs.statSync(srcPath);
    totalOriginal += origStats.size;

    await sharp(srcPath)
      .webp({
        quality: img.quality,
        lossless: img.lossless,
        effort: 6, // High compression effort for smallest size without quality loss
      })
      .toFile(destPath);

    const newStats = fs.statSync(destPath);
    totalConverted += newStats.size;

    const reduction = ((1 - newStats.size / origStats.size) * 100).toFixed(1);
    console.log(
      `✓ ${img.src.padEnd(24)} (${(origStats.size / 1024).toFixed(1)} KB) → ${img.dest.padEnd(24)} (${(newStats.size / 1024).toFixed(1)} KB) [Saved ${reduction}%]`
    );
  }

  console.log("\n==========================================");
  console.log(`Original Total : ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`WebP Total     : ${(totalConverted / (1024 * 1024)).toFixed(2)} MB`);
  console.log(
    `Total Reduction: ${((1 - totalConverted / totalOriginal) * 100).toFixed(1)}% savings! 🎉`
  );
  console.log("==========================================\n");
}

convertAll().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
