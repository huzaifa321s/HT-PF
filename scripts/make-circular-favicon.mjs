import sharp from "sharp";
import fs from "fs";

async function generateCircularFavicon() {
  const sourcePath = fs.existsSync("public/download.png")
    ? "public/download.png"
    : "public/download.webp";

  console.log("Using source image:", sourcePath);

  const size = 512;
  // Create an SVG circular mask with anti-aliasing
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" /></svg>`
  );

  // Resize and composite with circle mask
  const circular512 = await sharp(sourcePath)
    .resize(size, size, { fit: "cover", position: "center" })
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Save 512x512
  await sharp(circular512).toFile("public/favicon-circular.png");
  await sharp(circular512).toFile("public/favicon.png");
  await sharp(circular512).toFile("src/app/icon.png");
  await sharp(circular512).toFile("src/app/apple-icon.png");

  // Save 192x192
  await sharp(circular512).resize(192, 192).toFile("public/icon-192.png");

  // Save 32x32 and 16x16
  const buffer32 = await sharp(circular512).resize(32, 32).png().toBuffer();
  const buffer16 = await sharp(circular512).resize(16, 16).png().toBuffer();

  await sharp(buffer32).toFile("public/favicon-32x32.png");
  await sharp(buffer16).toFile("public/favicon-16x16.png");

  // Also update download.webp with a clean circular webp so logo appearances are rounded
  const circularWebp = await sharp(circular512).resize(200, 200).webp({ quality: 95 }).toBuffer();
  await sharp(circularWebp).toFile("public/download.webp");

  // Also generate src/app/favicon.ico and public/favicon.ico
  await sharp(buffer32).toFile("src/app/favicon.ico");
  await sharp(buffer32).toFile("public/favicon.ico");

  console.log("Successfully generated all circular favicons and icons!");
}

generateCircularFavicon().catch(console.error);
