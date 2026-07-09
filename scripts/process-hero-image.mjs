import sharp from "sharp";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const inputPath = process.argv[2];
const heroWidth = 1920;
const heroQuality = 88;
const jpegOutput = join(root, "public/hero-bogdana-beach.jpeg");
const webpOutput = join(root, "public/hero-bogdana-beach.webp");

if (!inputPath) {
  console.error("Usage: node scripts/process-hero-image.mjs <path-to-image>");
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const metadata = await sharp(inputPath).metadata();

await sharp(inputPath)
  .rotate()
  .resize({ width: heroWidth, withoutEnlargement: false })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(jpegOutput);

await sharp(inputPath)
  .rotate()
  .resize({ width: heroWidth, withoutEnlargement: false })
  .webp({ quality: heroQuality })
  .toFile(webpOutput);

const webpMeta = await sharp(webpOutput).metadata();

console.log(`Source: ${metadata.width}x${metadata.height}`);
console.log(`Created: public/hero-bogdana-beach.jpeg`);
console.log(`Created: public/hero-bogdana-beach.webp (${webpMeta.width}x${webpMeta.height})`);
console.log("");
console.log("Update constants/images.ts heroImageWidth and heroImageHeight if dimensions changed.");
