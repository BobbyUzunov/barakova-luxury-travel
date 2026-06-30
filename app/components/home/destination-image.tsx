"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  getDestinationImageFallback,
  getLocalDestinationImage,
} from "../../../constants/destination-images";

export function DestinationImage({
  alt,
  remoteSrc,
  slug,
}: {
  alt: string;
  remoteSrc: string;
  slug?: string;
}) {
  const sources = useMemo(
    () =>
      slug
        ? [
            getLocalDestinationImage(slug),
            remoteSrc,
            getDestinationImageFallback(),
          ]
        : [remoteSrc, getDestinationImageFallback()],
    [remoteSrc, slug],
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sources[Math.min(sourceIndex, sources.length - 1)];

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      quality={60}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className="destination-image"
      onError={() =>
        setSourceIndex((current) =>
          Math.min(current + 1, sources.length - 1),
        )
      }
    />
  );
}
