"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  heroImageMobile,
} from "../../../constants/images";
import { heroMobileMaxWidth } from "../../../constants/hero-video";
import {
  canUseHeroVideo,
  getHeroVideoLoadDelayMs,
  heroVimeoEmbedUrl,
  isMobileViewport,
  shouldLoadHeroVideoOnMobile,
} from "../../../constants/hero-video";
import {
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  subscribeToCookieConsent,
} from "../../../lib/cookie-consent-store";

const VIDEO_LOAD_TIMEOUT_MS = 12_000;
const MOBILE_VIDEO_LOAD_TIMEOUT_MS = 8_000;
const VIMEO_ORIGIN = "https://player.vimeo.com";
const mobileMediaQuery = `(max-width: ${heroMobileMaxWidth}px)`;

function subscribeToMobileViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(mobileMediaQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(mobileMediaQuery).matches;
}

type HeroBackgroundProps = {
  imageAlt: string;
  imageSrc: string;
  videoTitle?: string;
  onVideoActiveChange?: (active: boolean) => void;
};

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

function configureVimeoPlayer(iframe: HTMLIFrameElement) {
  postToVimeoPlayer(iframe, "addEventListener", "ready");
  postToVimeoPlayer(iframe, "addEventListener", "playing");
  postToVimeoPlayer(iframe, "play");

  if (isMobileViewport()) {
    postToVimeoPlayer(iframe, "setQuality", "360p");
  }
}

export function HeroBackground({
  imageAlt,
  imageSrc,
  videoTitle,
  onVideoActiveChange,
}: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    () => false,
  );
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const resolvedImageSrc = isMobile ? heroImageMobile : imageSrc;
  const imageQuality = isMobile ? 72 : 85;
  const hasVideoConsent = consent === "accepted";

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: "120px 0px", threshold: 0.12 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasVideoConsent || !isVisible || !canUseHeroVideo() || !shouldLoadHeroVideoOnMobile()) {
      return;
    }

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = VIMEO_ORIGIN;
    document.head.appendChild(preconnect);

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let frameId: number | undefined;

    const startVideoLoad = () => {
      if (!cancelled) {
        setLoadVideo(true);
      }
    };

    const delayMs = getHeroVideoLoadDelayMs();

    if (delayMs > 0) {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(startVideoLoad, {
          timeout: delayMs + 500,
        });
      } else {
        timeoutId = setTimeout(startVideoLoad, delayMs);
      }
    } else {
      frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(startVideoLoad);
      });
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
      preconnect.remove();
    };
  }, [hasVideoConsent, isVisible]);

  useEffect(() => {
    if (!loadVideo || !hasVideoConsent) {
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
            configureVimeoPlayer(iframe);
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
  }, [hasVideoConsent, loadVideo]);

  useEffect(() => {
    if (!hasVideoConsent || !loadVideo || videoFailed || videoPlaying) {
      return;
    }

    const timeoutMs = isMobileViewport()
      ? MOBILE_VIDEO_LOAD_TIMEOUT_MS
      : VIDEO_LOAD_TIMEOUT_MS;

    const timeoutId = window.setTimeout(() => {
      setVideoFailed(true);
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [hasVideoConsent, loadVideo, videoFailed, videoPlaying]);

  useEffect(() => {
    onVideoActiveChange?.(hasVideoConsent && videoPlaying && !videoFailed);
  }, [hasVideoConsent, onVideoActiveChange, videoFailed, videoPlaying]);

  useEffect(() => {
    if (!hasVideoConsent || !videoPlaying) {
      return;
    }

    const onVisibilityChange = () => {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      postToVimeoPlayer(iframe, document.hidden ? "pause" : "play");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [hasVideoConsent, videoPlaying]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    configureVimeoPlayer(iframe);
  };

  const showVideo = hasVideoConsent && loadVideo && !videoFailed;

  return (
    <div aria-hidden="true" className="hero-media" ref={containerRef}>
      <Image
        alt={imageAlt}
        className={`hero-image${videoPlaying ? " hero-image--video-ready" : ""}`}
        fetchPriority="high"
        fill
        priority
        quality={imageQuality}
        sizes={
          isMobile
            ? `(max-width: ${heroMobileMaxWidth}px) 100vw, 100vw`
            : "100vw"
        }
        src={resolvedImageSrc}
      />
      {showVideo ? (
        <div
          className={`hero-video${videoPlaying ? " hero-video--playing" : ""}`}
        >
          <iframe
            allow="autoplay; fullscreen; picture-in-picture"
            className="hero-video-iframe"
            loading="lazy"
            onError={() => setVideoFailed(true)}
            onLoad={handleIframeLoad}
            ref={iframeRef}
            src={heroVimeoEmbedUrl}
            tabIndex={-1}
            title={videoTitle || imageAlt}
          />
        </div>
      ) : null}
    </div>
  );
}
