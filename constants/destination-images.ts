import { destinationImageFallback } from "./images";

const destinationImageRoot = "/images/destinations";

/** Add slugs here after uploading matching .webp files to public/images/destinations/ */
export const localDestinationSlugs = new Set<string>();

export function getLocalDestinationImage(slug: string) {
  return `${destinationImageRoot}/${slug}.webp`;
}

export function resolveDestinationImage(slug: string | undefined, remoteSrc: string) {
  if (slug && localDestinationSlugs.has(slug)) {
    return getLocalDestinationImage(slug);
  }

  return remoteSrc;
}

export function getDestinationImageFallback() {
  return destinationImageFallback;
}
