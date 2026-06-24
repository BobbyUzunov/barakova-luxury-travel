import { destinationImageFallback } from "./images";

const destinationImageRoot = "/images/destinations";

export function getLocalDestinationImage(slug: string) {
  return `${destinationImageRoot}/${slug}.webp`;
}

export function resolveDestinationImage(slug: string | undefined, remoteSrc: string) {
  return slug ? getLocalDestinationImage(slug) : remoteSrc;
}

export function getDestinationImageFallback() {
  return destinationImageFallback;
}
