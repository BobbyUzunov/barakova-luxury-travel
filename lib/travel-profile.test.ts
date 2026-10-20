import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyTravelProfileUpdate,
  createEmptyTravelProfile,
  extractHeuristicProfileUpdate,
  sanitizeTravelProfile,
  sanitizeTravelProfileUpdate,
  travelProfileOpenAiSchema,
} from "./travel-profile";

function keepBudgetUpdate(value: {
  amount: number | null;
  min: number | null;
  max: number | null;
  currency: string | null;
  scope: "total" | "per_person" | null;
}) {
  return {
    destinations: { action: "keep" as const, value: [] },
    period: { action: "keep" as const, value: "" },
    year: { action: "keep" as const, value: 0 },
    dateFlexibility: { action: "keep" as const, value: "" },
    duration: { action: "keep" as const, value: "" },
    adults: { action: "keep" as const, value: 0 },
    children: { action: "keep" as const, value: 0 },
    childrenAges: { action: "keep" as const, value: [] },
    budget: { action: "set" as const, value },
    departure: { action: "keep" as const, value: "" },
    tripType: { action: "keep" as const, value: "" },
    preferences: { action: "keep" as const, value: [] },
    constraints: { action: "keep" as const, value: [] },
  };
}

describe("travel profile", () => {
  it("sanitizes unknown/invalid payload into a safe profile or null", () => {
    assert.equal(sanitizeTravelProfile(null), null);
    assert.equal(sanitizeTravelProfile("x"), null);

    const profile = sanitizeTravelProfile({
      destinations: ["  Малдиви ", "", 12, "Малдиви"],
      period: " септември ",
      year: 2099,
      adults: 2,
      childrenAges: [4, 99, 7],
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "eur",
        scope: "total",
      },
      preferences: ["тихо"],
      constraints: ["без дълги полети"],
      locale: "bg",
      updatedAt: "2026-01-01T00:00:00.000Z",
      extra: "drop-me",
    });

    assert.ok(profile);
    assert.deepEqual(profile?.destinations, ["Малдиви"]);
    assert.equal(profile?.period, "септември");
    assert.equal(profile?.year, 2099);
    assert.equal(
      sanitizeTravelProfile({
        ...createEmptyTravelProfile("bg"),
        year: 2099.2,
      })?.year,
      null,
    );
    assert.equal(profile?.adults, 2);
    assert.deepEqual(profile?.childrenAges, [4, 7]);
    assert.equal(profile?.budget?.currency, "EUR");
    assert.equal(profile?.budget?.scope, "total");
  });

  it("applies set, keep and clear updates distinctly", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      destinations: ["Малдиви"],
      period: "септември",
      adults: 2,
    };

    const kept = applyTravelProfileUpdate(base, sanitizeTravelProfileUpdate({}));
    assert.equal(kept.period, "септември");
    assert.equal(kept.adults, 2);

    const corrected = applyTravelProfileUpdate(base, {
      destinations: { action: "keep", value: [] },
      period: { action: "set", value: "октомври" },
      year: { action: "keep", value: 0 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "keep", value: 0 },
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
    });

    assert.equal(corrected.period, "октомври");
    assert.deepEqual(corrected.destinations, ["Малдиви"]);

    const cleared = applyTravelProfileUpdate(corrected, {
      destinations: { action: "clear", value: [] },
      period: { action: "clear", value: "" },
      year: { action: "keep", value: 0 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "clear", value: 0 },
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
    });

    assert.deepEqual(cleared.destinations, []);
    assert.equal(cleared.period, null);
    assert.equal(cleared.adults, null);
  });

  it("extracts light heuristics from short preference messages", () => {
    const update = extractHeuristicProfileUpdate(
      "за двама през септември 2027",
      "bg",
    );

    assert.equal(update.adults.action, "set");
    assert.equal(update.adults.value, 2);
    assert.equal(update.period.action, "set");
    assert.equal(update.period.value, "септември");
    assert.equal(update.year.action, "set");
    assert.equal(update.year.value, 2027);
  });

  it("rejects invalid set updates and keeps previous values", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      adults: 2,
      children: 1,
      period: "септември",
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total" as const,
      },
    };

    const next = applyTravelProfileUpdate(base, {
      destinations: { action: "keep", value: [] },
      period: { action: "set", value: "" },
      year: { action: "set", value: 1999 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "set", value: -5 },
      children: { action: "set", value: "invalid" },
      childrenAges: { action: "set", value: [2.5, "x"] },
      budget: {
        action: "set",
        value: {
          amount: "lots",
          min: null,
          max: null,
          currency: null,
          scope: "weekly",
        },
      },
      departure: { action: "keep", value: "" },
      tripType: { action: "keep", value: "" },
      preferences: { action: "keep", value: [] },
      constraints: { action: "keep", value: [] },
    });

    assert.equal(next.adults, 2);
    assert.equal(next.children, 1);
    assert.equal(next.period, "септември");
    assert.equal(next.year, null);
    assert.deepEqual(next.budget, base.budget);
  });

  it("keeps previous budget when set amount is invalid even with a valid currency", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total" as const,
      },
    };

    const next = applyTravelProfileUpdate(base, {
      destinations: { action: "keep", value: [] },
      period: { action: "keep", value: "" },
      year: { action: "keep", value: 0 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "keep", value: 0 },
      children: { action: "keep", value: 0 },
      childrenAges: { action: "keep", value: [] },
      budget: {
        action: "set",
        value: {
          amount: -1,
          min: null,
          max: null,
          currency: "EUR",
          scope: null,
        },
      },
      departure: { action: "keep", value: "" },
      tripType: { action: "keep", value: "" },
      preferences: { action: "keep", value: [] },
      constraints: { action: "keep", value: [] },
    });

    assert.deepEqual(next.budget, base.budget);
    assert.equal(next.budget?.amount, 5000);
  });

  it("keeps previous budget when set range has min greater than max", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total" as const,
      },
    };

    const next = applyTravelProfileUpdate(base, {
      destinations: { action: "keep", value: [] },
      period: { action: "keep", value: "" },
      year: { action: "keep", value: 0 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "keep", value: 0 },
      children: { action: "keep", value: 0 },
      childrenAges: { action: "keep", value: [] },
      budget: {
        action: "set",
        value: {
          amount: null,
          min: 6000,
          max: 3000,
          currency: "EUR",
          scope: "total",
        },
      },
      departure: { action: "keep", value: "" },
      tripType: { action: "keep", value: "" },
      preferences: { action: "keep", value: [] },
      constraints: { action: "keep", value: [] },
    });

    assert.deepEqual(next.budget, base.budget);
  });

  it("does not invent period from polite English or negated Bulgarian months", () => {
    const polite = extractHeuristicProfileUpdate(
      "May I ask what services you offer?",
      "en",
    );
    assert.equal(polite.period.action, "keep");

    const negated = extractHeuristicProfileUpdate(
      "Как да се свържа, не през май?",
      "bg",
    );
    assert.equal(negated.period.action, "keep");
  });
});

describe("budget and age profile processing (not live model behavior)", () => {
  it("keeps budget scope null when only amount and currency are set", () => {
    const next = applyTravelProfileUpdate(
      createEmptyTravelProfile("bg"),
      keepBudgetUpdate({
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: null,
      }),
    );

    assert.deepEqual(next.budget, {
      amount: 5000,
      min: null,
      max: null,
      currency: "EUR",
      scope: null,
    });
  });

  it("does not invent an exact child age from an upper-bound constraint update", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      children: 1,
      childrenAges: null,
    };

    const next = applyTravelProfileUpdate(base, {
      destinations: { action: "keep", value: [] },
      period: { action: "keep", value: "" },
      year: { action: "keep", value: 0 },
      dateFlexibility: { action: "keep", value: "" },
      duration: { action: "keep", value: "" },
      adults: { action: "keep", value: 0 },
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
      constraints: { action: "set", value: ["дете до 9 години"] },
    });

    assert.equal(next.children, 1);
    assert.equal(next.childrenAges, null);
    assert.deepEqual(next.constraints, ["дете до 9 години"]);
  });
});

describe("budget scope schema and processing (not live model behavior)", () => {
  it("restricts Structured Outputs budget.scope to total, per_person, or null", () => {
    const scopeSchema =
      travelProfileOpenAiSchema.properties.budget.properties.value.properties
        .scope;

    assert.deepEqual(scopeSchema.type, ["string", "null"]);
    assert.deepEqual(scopeSchema.enum, ["total", "per_person", null]);
  });

  it("accepts budget set with null scope and with total or per_person", () => {
    const empty = createEmptyTravelProfile("bg");

    const withNullScope = applyTravelProfileUpdate(
      empty,
      keepBudgetUpdate({
        amount: 8000,
        min: null,
        max: null,
        currency: "EUR",
        scope: null,
      }),
    );
    assert.deepEqual(withNullScope.budget, {
      amount: 8000,
      min: null,
      max: null,
      currency: "EUR",
      scope: null,
    });

    const withTotal = applyTravelProfileUpdate(
      empty,
      keepBudgetUpdate({
        amount: 6000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total",
      }),
    );
    assert.equal(withTotal.budget?.scope, "total");
    assert.equal(withTotal.budget?.amount, 6000);

    const withPerPerson = applyTravelProfileUpdate(
      empty,
      keepBudgetUpdate({
        amount: 2500,
        min: null,
        max: null,
        currency: "EUR",
        scope: "per_person",
      }),
    );
    assert.equal(withPerPerson.budget?.scope, "per_person");
    assert.equal(withPerPerson.budget?.amount, 2500);
  });

  it("keeps previous budget when scope is a localized or unknown string", () => {
    const base = {
      ...createEmptyTravelProfile("bg"),
      budget: {
        amount: 5000,
        min: null,
        max: null,
        currency: "EUR",
        scope: "total" as const,
      },
    };

    for (const scope of ["общо", "на човек", "weekly", "TOTAL"]) {
      const next = applyTravelProfileUpdate(base, {
        destinations: { action: "keep", value: [] },
        period: { action: "keep", value: "" },
        year: { action: "keep", value: 0 },
        dateFlexibility: { action: "keep", value: "" },
        duration: { action: "keep", value: "" },
        adults: { action: "keep", value: 0 },
        children: { action: "keep", value: 0 },
        childrenAges: { action: "keep", value: [] },
        budget: {
          action: "set",
          value: {
            amount: 6000,
            min: null,
            max: null,
            currency: "EUR",
            scope,
          },
        },
        departure: { action: "keep", value: "" },
        tripType: { action: "keep", value: "" },
        preferences: { action: "keep", value: [] },
        constraints: { action: "keep", value: [] },
      });
      assert.deepEqual(next.budget, base.budget, `scope=${scope}`);
    }
  });
});
