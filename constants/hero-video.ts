export const heroVimeoVideoId = "1204531589";

const heroVimeoParams = new URLSearchParams({
  background: "1",
  autoplay: "1",
  loop: "1",
  muted: "1",
  playsinline: "1",
  title: "0",
  byline: "0",
  portrait: "0",
  controls: "0",
  dnt: "1",
});

export const heroVimeoEmbedUrl = `https://player.vimeo.com/video/${heroVimeoVideoId}?${heroVimeoParams.toString()}`;

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
  return isMobileViewport() ? 700 : 0;
}
