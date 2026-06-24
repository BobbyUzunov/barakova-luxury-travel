"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { destinationImageFallback } from "../../../constants/images";

export function DestinationImage({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      quality={60}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className="destination-image"
      onError={() => setImageSrc(destinationImageFallback)}
    />
  );
}
