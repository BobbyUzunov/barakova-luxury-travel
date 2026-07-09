import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findFaqById, matchFaqAnswer } from "./chat-faq";
import { shouldPreferAiReply } from "./chat-routing";
import { normalizeChatBody, validateChatBody } from "./chat";

describe("chat helpers", () => {
  it("normalizes chat body and trims history", () => {
    const body = normalizeChatBody({
      message: "  Здравей  ",
      locale: "bg",
      history: [
        { role: "user", content: " Услуги " },
        { role: "assistant", content: "Отговор" },
        { role: "user", content: "" },
      ],
    });

    assert.equal(body.message, "Здравей");
    assert.equal(body.locale, "bg");
    assert.equal(body.history.length, 2);
  });

  it("rejects empty messages without faq id", () => {
    const body = normalizeChatBody({ message: "   ", locale: "en" });
    const validation = validateChatBody(body);

    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.equal(validation.error, "empty-message");
    }
  });

  it("matches FAQ answers for common questions", () => {
    const match = matchFaqAnswer("bg", "Какви услуги предлагате?");

    assert.ok(match);
    assert.match(match?.answer ?? "", /луксозни почивки/i);
  });

  it("finds FAQ entries by id", () => {
    const entry = findFaqById("en", "contact");

    assert.ok(entry);
    assert.match(entry?.answer ?? "", /0883 770 909/);
  });

  it("routes complex Bulgarian questions to AI instead of FAQ", () => {
    const message =
      "Препоръчай ми дестинация за меден месец през септември";

    assert.equal(shouldPreferAiReply(message, "bg"), true);
    assert.equal(matchFaqAnswer("bg", message), null);
  });

  it("routes Bulgarian comparison questions to AI", () => {
    const message =
      "Може ли да сравниш Сейшели и Мавриций за двойка, която не обича дълги полети?";

    assert.equal(shouldPreferAiReply(message, "bg"), true);
    assert.equal(matchFaqAnswer("bg", message), null);
  });

  it("keeps simple destination questions on FAQ", () => {
    const match = matchFaqAnswer("bg", "Разкажи ми за Малдивите");

    assert.ok(match);
    assert.match(match?.id ?? "", /^destination-/);
    assert.match(match?.answer ?? "", /Малдиви/i);
  });

  it("avoids false FAQ matches for nuanced hotel questions", () => {
    const message =
      "Каква е разликата между бутиков хотел и голям луксозен курорт за двойка?";

    assert.equal(shouldPreferAiReply(message, "bg"), true);
    assert.equal(matchFaqAnswer("bg", message), null);
  });
});
