import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEmptyTravelProfile } from "./travel-profile";
import { buildInquiryChatRequestBody } from "./inquiry-chat-request";

describe("inquiry chat request after new conversation (code path)", () => {
  it("sends empty history and empty profile after a reset-like message list", () => {
    const welcomeOnly = [
      {
        id: "welcome",
        role: "assistant" as const,
        content: "Здравейте!",
      },
    ];
    const emptyProfile = createEmptyTravelProfile("bg");

    const body = buildInquiryChatRequestBody({
      locale: "bg",
      message: "Искам Малдиви",
      messages: welcomeOnly,
      profile: emptyProfile,
    });

    assert.deepEqual(body.history, []);
    assert.equal(body.profile.destinations.length, 0);
    assert.equal(body.profile.period, null);
    assert.equal(body.profile.year, null);
    assert.equal(body.profile.budget, null);
    assert.equal(body.message, "Искам Малдиви");
  });

  it("includes prior turns only when they exist after welcome", () => {
    const body = buildInquiryChatRequestBody({
      locale: "en",
      message: "Prefer overwater villa.",
      messages: [
        { id: "welcome", role: "assistant", content: "Hello" },
        { id: "u1", role: "user", content: "Seychelles for two" },
        { id: "a1", role: "assistant", content: "Noted." },
      ],
      profile: {
        ...createEmptyTravelProfile("en"),
        destinations: ["Seychelles"],
        adults: 2,
      },
    });

    assert.equal(body.history.length, 2);
    assert.equal(body.history[0]?.content, "Seychelles for two");
    assert.deepEqual(body.profile.destinations, ["Seychelles"]);
  });
});
