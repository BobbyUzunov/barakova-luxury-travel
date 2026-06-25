"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  heroVideoMinWidth,
  heroVimeoEmbedUrl,
} from "../../../constants/hero-video";

const VIDEO_LOAD_TIMEOUT_MS = 12_000;

type HeroBackgroundProps = {
  imageAlt: string;
  imageSrc: string;
  onVideoActiveChange?: (active: boolean) => void;
};

function shouldEnableHeroVideo() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia(`(min-width: ${heroVideoMinWidth}px)`).matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function HeroBackground({
  imageAlt,
  imageSrc,
  onVideoActiveChange,
}: HeroBackgroundProps) {
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!shouldEnableHeroVideo()) {
      return;
    }

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleVideo = () => {
      if (!cancelled) {
        setLoadVideo(true);
      }
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(scheduleVideo, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(scheduleVideo, 400);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!loadVideo || videoFailed || videoReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setVideoFailed(true);
    }, VIDEO_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [loadVideo, videoFailed, videoReady]);

  useEffect(() => {
    onVideoActiveChange?.(videoReady && !videoFailed);
  }, [onVideoActiveChange, videoFailed, videoReady]);

  const showVideo = loadVideo && !videoFailed;

  return (
    <div aria-hidden="true" className="hero-media">
      <Image
        alt={imageAlt}
        className={`hero-image${videoReady ? " hero-image--video-ready" : ""}`}
        fetchPriority="high"
        fill
        priority
        quality={90}
        sizes="100vw"
        src={imageSrc}
      />
      {showVideo ? (
        <div className="hero-video">
          <iframe
            allow="autoplay; fullscreen; picture-in-picture"
            className="hero-video-iframe"
            loading="lazy"
            onError={() => setVideoFailed(true)}
            onLoad={() => setVideoReady(true)}
            src={heroVimeoEmbedUrl}
            tabIndex={-1}
            title=""
          />
        </div>
      ) : null}
    </div>
  );
}
