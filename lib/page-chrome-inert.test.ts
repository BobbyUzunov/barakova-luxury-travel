import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const localeLayoutPath = fileURLToPath(
  new URL("../app/[locale]/layout.tsx", import.meta.url),
);

describe("locale layout modal slot", () => {
  it("renders intercepting modals outside the inert page chrome", () => {
    const source = readFileSync(localeLayoutPath, "utf8");
    const appContentOpen = source.indexOf('<div id="app-content">');
    const appContentClose = source.indexOf("</div>", appContentOpen);
    const modalSlot = source.indexOf("{modal}");

    assert.notEqual(appContentOpen, -1);
    assert.notEqual(modalSlot, -1);
    assert.ok(
      modalSlot > appContentClose,
      "Intercepting {modal} must stay outside #app-content so lockPageChrome cannot disable dialog controls",
    );
  });
});
