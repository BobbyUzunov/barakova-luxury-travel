import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceIcon = join(root, "app/icon.svg");
const outputs = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
];

for (const [output, size] of outputs) {
  await sharp(sourceIcon)
    .resize(size, size)
    .png()
    .toFile(join(root, output));

  console.log(`Created ${output}`);
}
