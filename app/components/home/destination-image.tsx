"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getDestinationImageFallback,
  resolveDestinationImage,
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
  const preferredSrc = resolveDestinationImage(slug, remoteSrc);
  const [imageSrc, setImageSrc] = useState(preferredSrc);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      quality={60}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className="destination-image"
      onError={() => setImageSrc(getDestinationImageFallback())}
    />
  );
}
