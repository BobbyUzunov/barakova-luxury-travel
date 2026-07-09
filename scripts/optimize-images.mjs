import sharp from "sharp";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const heroWidth = 1920;
const heroQuality = 88;

const heroSources = [
  join(root, "public/hero-bogdana-beach.jpeg"),
  join(root, "public/hero-bogdana-beach.jpg"),
  join(root, "public/hero-bogdana-beach.png"),
];

const heroSource =
  heroSources.find((path) => existsSync(path)) ?? heroSources[0];

const images = [
  [heroSource, join(root, "public/hero-bogdana-beach.webp"), heroWidth, heroQuality],
  [join(root, "public/images/barakova-1.jpg"), join(root, "public/images/barakova-1.webp"), 1400, 78],
  [join(root, "public/images/barakova-2.jpg"), join(root, "public/images/barakova-2.webp"), 1200, 72],
];

for (const [input, output, width, quality] of images) {
  if (!existsSync(input)) {
    console.warn(`Skipped missing source: ${input}`);
    continue;
  }

  const metadata = await sharp(input).metadata();
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);

  console.log(
    `Created ${output.replace(`${root}/`, "")} (${metadata.width}x${metadata.height} -> max ${width}px)`,
  );
}

if (existsSync(join(root, "public/hero-bogdana-beach.webp"))) {
  const heroMeta = await sharp(join(root, "public/hero-bogdana-beach.webp")).metadata();
  console.log(`Hero dimensions: ${heroMeta.width}x${heroMeta.height}`);
}
