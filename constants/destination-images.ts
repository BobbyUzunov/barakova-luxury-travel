import { destinationImageFallback } from "./images";

const destinationImageRoot = "/images/destinations";
const localDestinationImageSlugs = new Set<string>();

export function getLocalDestinationImage(slug: string) {
  return `${destinationImageRoot}/${slug}.webp`;
}

export function resolveDestinationImage(slug: string | undefined, remoteSrc: string) {
  return slug && localDestinationImageSlugs.has(slug)
    ? getLocalDestinationImage(slug)
    : remoteSrc;
}

export function getDestinationImageFallback() {
  return destinationImageFallback;
}
