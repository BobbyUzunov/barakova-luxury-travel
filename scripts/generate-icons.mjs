import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceIcon = join(root, "app/icon.svg");
const outputs = [
  ["public/favicon.ico", 32],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
];

for (const [output, size] of outputs) {
  const pipeline = sharp(sourceIcon).resize(size, size);

  if (output.endsWith(".ico")) {
    // Browsers accept a PNG payload served as /favicon.ico.
    await pipeline.png().toFile(join(root, output));
  } else {
    await pipeline.png().toFile(join(root, output));
  }

  console.log(`Created ${output}`);
}
