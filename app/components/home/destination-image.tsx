"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getDestinationImageFallback } from "../../../constants/destination-images";

export function DestinationImage({
  alt,
  remoteSrc,
}: {
  alt: string;
  remoteSrc: string;
}) {
  const sources = useMemo(
    () => [remoteSrc, getDestinationImageFallback()],
    [remoteSrc],
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
