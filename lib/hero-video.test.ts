import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  heroVimeoEmbedUrl,
  heroVideoRevealSeconds,
  isHeroVideoPlayerError,
  shouldRevealHeroVideo,
} from "../constants/hero-video";

describe("hero vimeo embed", () => {
  it("uses a muted looping player without paid background mode", () => {
    const url = new URL(heroVimeoEmbedUrl);

    assert.equal(url.searchParams.get("background"), null);
    assert.equal(url.searchParams.get("autoplay"), "1");
    assert.equal(url.searchParams.get("muted"), "1");
    assert.equal(url.searchParams.get("loop"), "1");
    assert.equal(url.searchParams.get("controls"), "0");
    assert.equal(url.searchParams.get("title"), "0");
  });

  it("keeps the poster up until playback has actually advanced", () => {
    assert.equal(shouldRevealHeroVideo({ event: "ready" }), false);
    assert.equal(shouldRevealHeroVideo({ event: "playing" }), false);
    assert.equal(
      shouldRevealHeroVideo({
        event: "timeupdate",
        data: { seconds: heroVideoRevealSeconds - 0.05 },
      }),
      false,
    );
    assert.equal(
      shouldRevealHeroVideo({
        event: "timeupdate",
        data: { seconds: heroVideoRevealSeconds },
      }),
      true,
    );
    assert.equal(
      shouldRevealHeroVideo({
        event: "playProgress",
        data: { seconds: heroVideoRevealSeconds },
      }),
      true,
    );
  });

  it("treats player errors as a reason to stay on the photo", () => {
    assert.equal(isHeroVideoPlayerError({ event: "error" }), true);
    assert.equal(isHeroVideoPlayerError({ event: "playing" }), false);
  });
});
