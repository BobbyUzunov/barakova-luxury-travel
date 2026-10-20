import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEmptyTravelProfile } from "./travel-profile";
import {
  applyHandoffFieldsToFormValues,
  buildTravelSummary,
  extractSummaryBlock,
  formatTravelSummaryBlock,
  interpretDateFlexibility,
  isSummaryBlockIntact,
  mergeMessageWithSummary,
  summaryBlockEndMarker,
  summaryBlockStartMarker,
} from "./travel-summary";
import { maxMessageLength } from "./contact";

describe("travel summary", () => {
  it("formats BG and EN summaries from known profile fields only", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      destinations: ["Сицилия"],
      period: "октомври",
      year: 2027,
      dateFlexibility: "±3 дни",
      duration: "7 нощувки",
      adults: 2,
      children: 1,
      childrenAges: [8],
      constraints: ["дете до 9"],
      budget: {
        amount: 8000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total" as const,
      },
      departure: "София",
      tripType: "семейно",
      preferences: ["тихо", "море"],
    };

    const bg = buildTravelSummary(base);
    assert.equal(bg.hasUsefulData, true);
    assert.match(bg.text, /Дестинации: Сицилия/);
    assert.match(bg.text, /Период: октомври/);
    assert.match(bg.text, /Година: 2027/);
    assert.match(bg.text, /Продължителност: 7 нощувки/);
    assert.match(bg.text, /Възрастни: 2/);
    assert.match(bg.text, /Деца: 1/);
    assert.match(bg.text, /Потвърдени възрасти на деца: 8/);
    assert.match(bg.text, /дете до 9/);
    assert.match(bg.text, /общо/);
    assert.equal(bg.fields.destination, "Сицилия");
    assert.equal(bg.fields.travelers, "3");
    assert.equal(bg.fields.travelStartDate, undefined);
    assert.match(bg.fields.budget ?? "", /8[\s\u00a0\u202f]?000 EUR \(общо\)/);

    const en = buildTravelSummary({ ...base, locale: "en" });
    assert.match(en.text, /Destinations: Сицилия/);
    assert.match(en.text, /Period: октомври/);
    assert.match(en.text, /Duration: 7 нощувки/);
    assert.match(en.text, /total/);
    assert.match(en.fields.budget ?? "", /8[,.\s\u00a0\u202f]?000 EUR \(total\)/);
  });

  it("keeps incomplete profiles and unknown budget scope honest", () => {
    const profile = {
      ...createEmptyTravelProfile("en"),
      destinations: ["Maldives"],
      adults: 2,
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: null,
      },
    };

    const summary = buildTravelSummary(profile);
    assert.equal(summary.fields.travelers, undefined);
    assert.match(summary.text, /scope unspecified/);
    assert.match(summary.fields.budget ?? "", /5[,.\s\u00a0\u202f]?000 EUR$/);
    assert.doesNotMatch(summary.fields.budget ?? "", /total|per person/);
  });

  it("maps exact ISO dates but leaves approximate periods in notes only", () => {
    const exact = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      period: "2027-10-12 – 2027-10-19",
      destinations: ["Гърция"],
    });
    assert.equal(exact.fields.travelStartDate, "2027-10-12");
    assert.equal(exact.fields.travelEndDate, "2027-10-19");

    const approximate = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      period: "октомври",
      year: 2027,
      duration: "7 нощувки",
      dateFlexibility: "гъвкави",
    });
    assert.equal(approximate.fields.travelStartDate, undefined);
    assert.equal(approximate.fields.travelEndDate, undefined);
    assert.equal(approximate.fields.datesFlexible, true);
    assert.match(approximate.text, /октомври/);
    assert.match(approximate.text, /7 нощувки/);
  });

  it("preserves manual form values and merges summary once", () => {
    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Италия"],
      adults: 2,
      children: 0,
      budget: {
        amount: 4000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total",
      },
    });

    const current = {
      destination: "Ръчна дестинация",
      travelStartDate: "",
      travelEndDate: "",
      datesFlexible: false,
      travelers: "4",
      budget: "",
      message: "Моят текст",
    };

    const filled = applyHandoffFieldsToFormValues(current, summary.fields);
    assert.equal(filled.next.destination, "Ръчна дестинация");
    assert.equal(filled.next.travelers, "4");
    assert.match(filled.next.budget, /4[\s\u00a0\u202f]?000 EUR \(общо\)/);

    const block = formatTravelSummaryBlock(summary, "bg");
    const first = mergeMessageWithSummary({
      existing: current.message,
      summaryBlock: block,
      fingerprint: summary.fingerprint,
      locale: "bg",
    });
    assert.equal(first.status, "appended");
    assert.match(first.message, /Моят текст/);
    assert.ok(first.message.includes(summaryBlockStartMarker));

    const second = mergeMessageWithSummary({
      existing: first.message,
      summaryBlock: block,
      fingerprint: summary.fingerprint,
      locale: "bg",
    });
    assert.equal(second.status, "already-present");
    assert.equal(
      second.message.split(summaryBlockStartMarker).length - 1,
      1,
    );
  });

  it("replaces an intact newer summary and conflicts when edited", () => {
    const firstSummary = buildTravelSummary({
      ...createEmptyTravelProfile("en"),
      destinations: ["Sicily"],
    });
    const secondSummary = buildTravelSummary({
      ...createEmptyTravelProfile("en"),
      destinations: ["Sicily", "Amalfi"],
    });

    const firstBlock = formatTravelSummaryBlock(firstSummary, "en");
    const secondBlock = formatTravelSummaryBlock(secondSummary, "en");

    const withFirst = mergeMessageWithSummary({
      existing: "Hello",
      summaryBlock: firstBlock,
      fingerprint: firstSummary.fingerprint,
      locale: "en",
    });
    assert.equal(isSummaryBlockIntact(withFirst.message, "en"), true);

    const replaced = mergeMessageWithSummary({
      existing: withFirst.message,
      summaryBlock: secondBlock,
      fingerprint: secondSummary.fingerprint,
      locale: "en",
    });
    assert.equal(replaced.status, "replaced");
    assert.match(replaced.message, /Amalfi/);
    assert.equal(
      replaced.message.split(summaryBlockStartMarker).length - 1,
      1,
    );

    const edited = withFirst.message.replace("Sicily", "EDITED");
    assert.equal(isSummaryBlockIntact(edited, "en"), false);
    const conflict = mergeMessageWithSummary({
      existing: edited,
      summaryBlock: secondBlock,
      fingerprint: secondSummary.fingerprint,
      locale: "en",
    });
    assert.equal(conflict.status, "conflict");
    assert.match(conflict.message, /EDITED/);

    const forced = mergeMessageWithSummary({
      existing: edited,
      summaryBlock: secondBlock,
      fingerprint: secondSummary.fingerprint,
      locale: "en",
      forceReplace: true,
    });
    assert.equal(forced.status, "replaced");
    assert.match(forced.message, /Amalfi/);
    assert.doesNotMatch(forced.message, /EDITED/);
  });

  it("extracts summary blocks safely", () => {
    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Париж"],
    });
    const message = `Клиент\n\n${formatTravelSummaryBlock(summary, "bg")}\n\nкрай`;
    const extracted = extractSummaryBlock(message);
    assert.equal(extracted.before, "Клиент");
    assert.equal(extracted.after, "край");
    assert.ok(extracted.block?.includes(summaryBlockEndMarker));
    assert.equal(extracted.fingerprint, summary.fingerprint);
  });

  it("does not treat fixed or unclear flexibility as datesFlexible=true", () => {
    assert.equal(interpretDateFlexibility("гъвкави"), true);
    assert.equal(interpretDateFlexibility("flexible ±3 days"), true);
    assert.equal(interpretDateFlexibility("фиксирани дати"), false);
    assert.equal(interpretDateFlexibility("без гъвкавост"), false);
    assert.equal(interpretDateFlexibility("fixed dates"), false);
    assert.equal(interpretDateFlexibility("no flexibility"), false);
    assert.equal(interpretDateFlexibility("нещо неясно"), null);
    assert.equal(interpretDateFlexibility("maybe"), null);
    assert.equal(interpretDateFlexibility(""), null);
    assert.equal(interpretDateFlexibility(null), null);

    const fixed = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Рим"],
      dateFlexibility: "фиксирани дати",
    });
    assert.equal(fixed.fields.datesFlexible, false);

    const unclear = buildTravelSummary({
      ...createEmptyTravelProfile("en"),
      destinations: ["Rome"],
      dateFlexibility: "tbd later",
    });
    assert.equal(unclear.fields.datesFlexible, undefined);
  });

  it("skips touched fields including manual false and cleared values", () => {
    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Сицилия"],
      adults: 2,
      children: 0,
      dateFlexibility: "гъвкави",
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total",
      },
    });

    const current = {
      destination: "",
      travelStartDate: "",
      travelEndDate: "",
      datesFlexible: false,
      travelers: "",
      budget: "",
    };

    const untouched = applyHandoffFieldsToFormValues(current, summary.fields);
    assert.equal(untouched.next.destination, "Сицилия");
    assert.equal(untouched.next.datesFlexible, true);
    assert.equal(untouched.next.travelers, "2");

    const touched = applyHandoffFieldsToFormValues(
      {
        ...current,
        destination: "",
        datesFlexible: false,
      },
      summary.fields,
      new Set(["destination", "datesFlexible"]),
    );
    assert.equal(touched.next.destination, "");
    assert.equal(touched.next.datesFlexible, false);
    assert.equal(touched.next.travelers, "2");
    assert.ok(!touched.filledKeys.includes("destination"));
    assert.ok(!touched.filledKeys.includes("datesFlexible"));
  });

  it("keeps client message intact when summary does not fit", () => {
    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Малдиви", "Сейшели", "Мавриций"],
      period: "октомври",
      year: 2027,
      adults: 2,
      children: 1,
      preferences: ["тихо", "море", "spa"],
      constraints: ["без дълги полети"],
    });
    const block = formatTravelSummaryBlock(summary, "bg");
    const clientText = "X".repeat(maxMessageLength - 20);

    const result = mergeMessageWithSummary({
      existing: clientText,
      summaryBlock: block,
      fingerprint: summary.fingerprint,
      locale: "bg",
    });

    assert.equal(result.status, "too-long");
    assert.equal(result.summaryAdded, false);
    assert.equal(result.message, clientText);
    assert.ok(!result.message.includes(summaryBlockStartMarker));
  });
});
