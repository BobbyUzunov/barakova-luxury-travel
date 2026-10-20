import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findFaqById, matchFaqAnswer } from "./chat-faq";
import {
  isClearStandaloneFaqIntent,
  isPreferenceStatement,
  shouldPreferAiReply,
} from "./chat-routing";
import { normalizeChatBody, validateChatBody } from "./chat";
import {
  createEmptyTravelProfile,
  extractHeuristicProfileUpdate,
} from "./travel-profile";

describe("chat helpers", () => {
  it("normalizes chat body, trims history and sanitizes profile", () => {
    const body = normalizeChatBody({
      message: "  Здравей  ",
      locale: "bg",
      history: [
        { role: "user", content: " Услуги " },
        { role: "assistant", content: "Отговор" },
        { role: "user", content: "" },
      ],
      profile: {
        ...createEmptyTravelProfile("bg"),
        destinations: [" Малдиви ", "hack<script>"],
        adults: 2,
      },
    });

    assert.equal(body.message, "Здравей");
    assert.equal(body.locale, "bg");
    assert.equal(body.history.length, 2);
    assert.deepEqual(body.profile.destinations, ["Малдиви", "hack<script>"]);
    assert.equal(body.profile.adults, 2);
  });

  it("rejects empty messages without faq id", () => {
    const body = normalizeChatBody({ message: "   ", locale: "en" });
    const validation = validateChatBody(body);

    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.equal(validation.error, "empty-message");
    }
  });

  it("matches FAQ answers for common standalone questions", () => {
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

  it("sends preference statements and short follow-ups to conversation context", () => {
    assert.equal(isPreferenceStatement("Искам Малдиви", "bg"), true);
    assert.equal(matchFaqAnswer("bg", "Искам Малдиви"), null);

    const followUp = matchFaqAnswer("bg", "за двама", [
      { role: "user", content: "Искам Малдиви" },
      { role: "assistant", content: "Чудесен избор." },
    ]);
    assert.equal(followUp, null);

    assert.equal(isPreferenceStatement("for two in September", "en"), true);
    assert.equal(matchFaqAnswer("en", "for two in September"), null);
  });

  it("still allows clear standalone FAQ during an active consultation", () => {
    assert.equal(isClearStandaloneFaqIntent("Как да се свържа с вас?", "bg"), true);

    const match = matchFaqAnswer("bg", "Как да се свържа с вас?", [
      { role: "user", content: "Искам Малдиви" },
      { role: "assistant", content: "За колко души пътувате?" },
      { role: "user", content: "за двама" },
    ]);

    assert.ok(match);
    assert.equal(match?.id, "contact");
  });

  it("keeps suggestContact intent for contact and budget FAQ ids", () => {
    assert.equal(findFaqById("bg", "contact")?.id, "contact");
    assert.equal(findFaqById("bg", "budget")?.id, "budget");
    assert.equal(findFaqById("en", "consultation")?.id, "consultation");
  });

  it("answers FAQ without inventing period from polite or negated phrasing", () => {
    const enFaq = matchFaqAnswer("en", "May I ask what services you offer?");
    assert.ok(enFaq);
    assert.equal(enFaq?.id, "services");
    assert.equal(
      extractHeuristicProfileUpdate("May I ask what services you offer?", "en")
        .period.action,
      "keep",
    );

    const bgFaq = matchFaqAnswer("bg", "Как да се свържа, не през май?");
    assert.ok(bgFaq);
    assert.equal(bgFaq?.id, "contact");
    assert.equal(
      extractHeuristicProfileUpdate("Как да се свържа, не през май?", "bg")
        .period.action,
      "keep",
    );
  });
});
