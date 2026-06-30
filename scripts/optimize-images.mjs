import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const images = [
  ["public/hero-bogdana-beach.jpeg", "public/hero-bogdana-beach.webp", 1920, 88],
  ["public/images/barakova-1.jpg", "public/images/barakova-1.webp", 1400, 78],
  ["public/images/barakova-2.jpg", "public/images/barakova-2.webp", 1200, 72],
];

for (const [input, output, width, quality] of images) {
  await sharp(join(root, input))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(join(root, output));

  console.log(`Created ${output}`);
}
