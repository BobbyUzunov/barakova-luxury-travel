import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  buildOpenAiChatRequestBody,
  chatMaxCompletionTokens,
  chatReasoningEffort,
  defaultChatModel,
  generateAiReply,
  parseStructuredChatAgentPayload,
} from "./chat-agent";
import {
  createEmptyTravelProfile,
  travelProfileOpenAiSchema,
} from "./travel-profile";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe("chat agent request shape for gpt-5.4-mini", () => {
  it("uses reasoning_effort none, max_completion_tokens, and no temperature", () => {
    const body = buildOpenAiChatRequestBody({
      locale: "bg",
      message: "Искам Малдиви",
      history: [],
      profile: createEmptyTravelProfile("bg"),
      model: defaultChatModel,
    });

    assert.equal(body.model, "gpt-5.4-mini");
    assert.equal(body.reasoning_effort, chatReasoningEffort);
    assert.equal(body.reasoning_effort, "none");
    assert.equal(body.max_completion_tokens, chatMaxCompletionTokens);
    assert.equal("temperature" in body, false);
    assert.equal("max_tokens" in body, false);
    assert.equal(body.response_format.type, "json_schema");
  });

  it("wires budget.scope enum into the request schema (processing, not live model)", () => {
    const body = buildOpenAiChatRequestBody({
      locale: "bg",
      message: "бюджет 8000 евро общо",
      history: [],
      profile: createEmptyTravelProfile("bg"),
    });

    const schema = body.response_format.json_schema.schema;
    const scope =
      schema.properties.profileUpdate.properties.budget.properties.value
        .properties.scope;

    assert.deepEqual(
      scope,
      travelProfileOpenAiSchema.properties.budget.properties.value.properties
        .scope,
    );
    assert.deepEqual(scope.enum, ["total", "per_person", null]);
  });

  it("instructs BG and EN prompts on scope machine values, preferences vs tripType, and suggestContact", () => {
    const bg = buildOpenAiChatRequestBody({
      locale: "bg",
      message: "тест",
      history: [],
      profile: createEmptyTravelProfile("bg"),
    }).messages[0].content;

    const en = buildOpenAiChatRequestBody({
      locale: "en",
      message: "test",
      history: [],
      profile: createEmptyTravelProfile("en"),
    }).messages[0].content;

    assert.match(bg, /scope=null/);
    assert.match(bg, /total/);
    assert.match(bg, /per_person/);
    assert.match(bg, /общо/);
    assert.match(bg, /на човек/);
    assert.match(bg, /полетите|flights/i);
    assert.match(bg, /suggestContact=true/);
    assert.match(bg, /preferences/);
    assert.match(bg, /tripType/);
    assert.match(bg, /дете до 9/);
    assert.match(bg, /childrenAges/);
    assert.match(bg, /7 нощувки/);
    assert.match(bg, /не обещавай|без проверени/i);

    assert.match(en, /scope=null/);
    assert.match(en, /total/);
    assert.match(en, /per_person/);
    assert.match(en, /flights/i);
    assert.match(en, /suggestContact=true/);
    assert.match(en, /Prefer overwater villa/);
    assert.match(en, /tripType/);
    assert.match(en, /under 9/);
    assert.match(en, /7 nights/);
    assert.match(en, /do not promise|no verified/i);
  });
});

describe("chat agent structured parsing", () => {
  it("parses a valid structured payload", () => {
    const parsed = parseStructuredChatAgentPayload({
      reply: "Можем да уточним периода.",
      suggestContact: true,
      profileUpdate: {
        destinations: { action: "set", value: ["Малдиви"] },
        period: { action: "keep", value: "" },
        year: { action: "keep", value: 0 },
        dateFlexibility: { action: "keep", value: "" },
        duration: { action: "keep", value: "" },
        adults: { action: "set", value: 2 },
        children: { action: "keep", value: 0 },
        childrenAges: { action: "keep", value: [] },
        budget: {
          action: "keep",
          value: {
            amount: null,
            min: null,
            max: null,
            currency: null,
            scope: null,
          },
        },
        departure: { action: "keep", value: "" },
        tripType: { action: "keep", value: "" },
        preferences: { action: "keep", value: [] },
        constraints: { action: "keep", value: [] },
      },
    });

    assert.ok(parsed);
    assert.equal(parsed?.suggestContact, true);
    assert.match(parsed?.reply ?? "", /периода/);
  });

  it("rejects empty or invalid structured payloads", () => {
    assert.equal(parseStructuredChatAgentPayload(null), null);
    assert.equal(parseStructuredChatAgentPayload({ reply: "   " }), null);
    assert.equal(parseStructuredChatAgentPayload({ suggestContact: true }), null);
  });
});

describe("generateAiReply fallbacks", () => {
  it("returns fallback when API key is missing and keeps profile", async () => {
    delete process.env.OPENAI_API_KEY;
    const profile = {
      ...createEmptyTravelProfile("bg"),
      destinations: ["Малдиви"],
    };

    const result = await generateAiReply({
      locale: "bg",
      message: "за двама",
      history: [],
      profile,
    });

    assert.equal(result.source, "fallback");
    assert.equal(result.suggestContact, true);
    assert.deepEqual(result.profile.destinations, ["Малдиви"]);
  });

  it("returns fallback on API error and keeps the last valid profile", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    globalThis.fetch = (async () =>
      new Response("nope", { status: 500 })) as typeof fetch;

    const profile = {
      ...createEmptyTravelProfile("en"),
      period: "September",
      adults: 2,
    };

    const result = await generateAiReply({
      locale: "en",
      message: "for two",
      history: [],
      profile,
    });

    assert.equal(result.source, "fallback");
    assert.equal(result.profile.period, "September");
    assert.equal(result.profile.adults, 2);
  });

  it("returns fallback on invalid JSON content", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    globalThis.fetch = (async () =>
      Response.json({
        choices: [{ message: { content: "not-json" } }],
      })) as typeof fetch;

    const profile = createEmptyTravelProfile("bg");
    const result = await generateAiReply({
      locale: "bg",
      message: "здравей",
      history: [],
      profile,
    });

    assert.equal(result.source, "fallback");
  });

  it("returns fallback on model refusal", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    globalThis.fetch = (async () =>
      Response.json({
        choices: [{ message: { refusal: "refused", content: null } }],
      })) as typeof fetch;

    const result = await generateAiReply({
      locale: "bg",
      message: "здравей",
      history: [],
      profile: createEmptyTravelProfile("bg"),
    });

    assert.equal(result.source, "fallback");
  });

  it("returns fallback on truncated finish_reason length", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const profile = {
      ...createEmptyTravelProfile("bg"),
      destinations: ["Малдиви"],
    };
    globalThis.fetch = (async () =>
      Response.json({
        choices: [
          {
            finish_reason: "length",
            message: { content: '{"reply":"partial"' },
          },
        ],
      })) as typeof fetch;

    const result = await generateAiReply({
      locale: "bg",
      message: "здравей",
      history: [],
      profile,
    });

    assert.equal(result.source, "fallback");
    assert.deepEqual(result.profile.destinations, ["Малдиви"]);
  });

  it("returns fallback on timeout/abort", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    globalThis.fetch = (async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    }) as typeof fetch;

    const profile = {
      ...createEmptyTravelProfile("en"),
      adults: 2,
    };

    const result = await generateAiReply({
      locale: "en",
      message: "hello",
      history: [],
      profile,
    });

    assert.equal(result.source, "fallback");
    assert.equal(result.profile.adults, 2);
  });

  it("applies structured profile updates from a successful mock response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    globalThis.fetch = (async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                reply: "Малдивите са подходящи за спокоен меден месец.",
                suggestContact: false,
                profileUpdate: {
                  destinations: { action: "set", value: ["Малдиви"] },
                  period: { action: "set", value: "септември" },
                  year: { action: "keep", value: 0 },
                  dateFlexibility: { action: "keep", value: "" },
                  duration: { action: "keep", value: "" },
                  adults: { action: "set", value: 2 },
                  children: { action: "keep", value: 0 },
                  childrenAges: { action: "keep", value: [] },
                  budget: {
                    action: "keep",
                    value: {
                      amount: null,
                      min: null,
                      max: null,
                      currency: null,
                      scope: null,
                    },
                  },
                  departure: { action: "keep", value: "" },
                  tripType: { action: "set", value: "меден месец" },
                  preferences: { action: "keep", value: [] },
                  constraints: { action: "keep", value: [] },
                },
              }),
            },
          },
        ],
      })) as typeof fetch;

    const result = await generateAiReply({
      locale: "bg",
      message: "Искам Малдиви за двама през септември",
      history: [],
      profile: createEmptyTravelProfile("bg"),
    });

    assert.equal(result.source, "ai");
    assert.equal(result.suggestContact, false);
    assert.deepEqual(result.profile.destinations, ["Малдиви"]);
    assert.equal(result.profile.period, "септември");
    assert.equal(result.profile.adults, 2);
    assert.equal(result.profile.tripType, "меден месец");
  });
});
