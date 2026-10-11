export const heroVimeoVideoId = "1204531589";

/**
 * Seconds of real playback before the poster may fade out.
 * `playing` alone can fire while the first frame is still black.
 */
export const heroVideoRevealSeconds = 0.2;

/**
 * Muted looping embed without Vimeo background mode.
 * Background mode is limited to paid plans; this account is free, so
 * `background=1` can leave the player on an error or spinner instead of
 * the clip. The poster stays on top until playback is confirmed.
 */
const heroVimeoParams = new URLSearchParams({
  api: "1",
  autoplay: "1",
  autopause: "0",
  loop: "1",
  muted: "1",
  playsinline: "1",
  title: "0",
  byline: "0",
  portrait: "0",
  controls: "0",
  keyboard: "0",
  dnt: "1",
  transparent: "0",
});

export const heroVimeoEmbedUrl = `https://player.vimeo.com/video/${heroVimeoVideoId}?${heroVimeoParams.toString()}`;

export type HeroVimeoPlayerMessage = {
  event?: string;
  data?: {
    seconds?: number;
  };
};

export function shouldRevealHeroVideo(message: HeroVimeoPlayerMessage) {
  if (message.event !== "timeupdate" && message.event !== "playProgress") {
    return false;
  }

  return (message.data?.seconds ?? 0) >= heroVideoRevealSeconds;
}

export function isHeroVideoPlayerError(message: HeroVimeoPlayerMessage) {
  return message.event === "error";
}

export const heroMobileMaxWidth = 767;

export function isMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(`(max-width: ${heroMobileMaxWidth}px)`).matches;
}

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

export function canUseHeroVideo() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;

  if (connection?.saveData) {
    return false;
  }

  if (
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  ) {
    return false;
  }

  return true;
}

export function getHeroVideoLoadDelayMs() {
  return isMobileViewport() ? 1200 : 0;
}

export function shouldLoadHeroVideoOnMobile() {
  if (!isMobileViewport()) {
    return true;
  }

  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;

  if (connection?.saveData) {
    return false;
  }

  if (
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "3g"
  ) {
    return false;
  }

  return true;
}
