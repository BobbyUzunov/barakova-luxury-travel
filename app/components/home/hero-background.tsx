"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  heroVideoMinWidth,
  heroVimeoEmbedUrl,
} from "../../../constants/hero-video";

const VIDEO_LOAD_TIMEOUT_MS = 12_000;
const VIMEO_ORIGIN = "https://player.vimeo.com";

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

function postToVimeoPlayer(
  iframe: HTMLIFrameElement,
  method: string,
  value?: string,
) {
  iframe.contentWindow?.postMessage(
    JSON.stringify(value ? { method, value } : { method }),
    VIMEO_ORIGIN,
  );
}

export function HeroBackground({
  imageAlt,
  imageSrc,
  onVideoActiveChange,
}: HeroBackgroundProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!shouldEnableHeroVideo()) {
      return;
    }

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = VIMEO_ORIGIN;
    document.head.appendChild(preconnect);

    let cancelled = false;
    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setLoadVideo(true);
        }
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      preconnect.remove();
    };
  }, []);

  useEffect(() => {
    if (!loadVideo) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== VIMEO_ORIGIN || typeof event.data !== "string") {
        return;
      }

      try {
        const data = JSON.parse(event.data) as { event?: string };

        if (data.event === "ready") {
          const iframe = iframeRef.current;
          if (iframe) {
            postToVimeoPlayer(iframe, "addEventListener", "playing");
            postToVimeoPlayer(iframe, "play");
          }
        }

        if (data.event === "playing") {
          setVideoPlaying(true);
        }
      } catch {
        // Ignore non-JSON Vimeo messages.
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loadVideo]);

  useEffect(() => {
    if (!loadVideo || videoFailed || videoPlaying) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setVideoFailed(true);
    }, VIDEO_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [loadVideo, videoFailed, videoPlaying]);

  useEffect(() => {
    onVideoActiveChange?.(videoPlaying && !videoFailed);
  }, [onVideoActiveChange, videoFailed, videoPlaying]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    postToVimeoPlayer(iframe, "addEventListener", "ready");
    postToVimeoPlayer(iframe, "addEventListener", "playing");
    postToVimeoPlayer(iframe, "play");
  };

  const showVideo = loadVideo && !videoFailed;

  return (
    <div aria-hidden="true" className="hero-media">
      <Image
        alt={imageAlt}
        className={`hero-image${videoPlaying ? " hero-image--video-ready" : ""}`}
        fetchPriority="high"
        fill
        priority
        quality={90}
        sizes="100vw"
        src={imageSrc}
      />
      {showVideo ? (
        <div
          className={`hero-video${videoPlaying ? " hero-video--playing" : ""}`}
        >
          <iframe
            allow="autoplay; fullscreen; picture-in-picture"
            className="hero-video-iframe"
            onError={() => setVideoFailed(true)}
            onLoad={handleIframeLoad}
            ref={iframeRef}
            src={heroVimeoEmbedUrl}
            tabIndex={-1}
            title=""
          />
        </div>
      ) : null}
    </div>
  );
}
