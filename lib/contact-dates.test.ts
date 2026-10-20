import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareIsoDates,
  formatTravelPeriodForEmail,
  localTodayIso,
  parseIsoDate,
  validateTravelDates,
} from "./contact-dates";

describe("contact travel dates (code paths, not live model)", () => {
  it("parses local today and valid calendar dates without UTC shifting", () => {
    const fixed = new Date(2026, 9, 20, 23, 30, 0);
    assert.equal(localTodayIso(fixed), "2026-10-20");

    assert.deepEqual(parseIsoDate("2027-03-15"), {
      year: 2027,
      month: 3,
      day: 15,
      iso: "2027-03-15",
    });
    assert.equal(parseIsoDate("2027-02-30"), null);
    assert.equal(parseIsoDate("15.03.2027"), null);
    assert.equal(parseIsoDate("March 15, 2027"), null);
  });

  it("accepts a valid range and incomplete single dates", () => {
    assert.equal(
      validateTravelDates({
        travelStartDate: "2027-03-15",
        travelEndDate: "2027-03-22",
      }, "2026-10-20").ok,
      true,
    );
    assert.equal(
      validateTravelDates({
        travelStartDate: "2027-03-15",
        travelEndDate: "",
      }, "2026-10-20").ok,
      true,
    );
    assert.equal(
      validateTravelDates({
        travelStartDate: "",
        travelEndDate: "2027-03-22",
      }, "2026-10-20").ok,
      true,
    );
    assert.equal(
      validateTravelDates({ datesFlexible: true }, "2026-10-20").ok,
      true,
    );
  });

  it("rejects reversed dates, invalid calendars, and past start dates", () => {
    const reversed = validateTravelDates(
      { travelStartDate: "2027-03-22", travelEndDate: "2027-03-15" },
      "2026-10-20",
    );
    assert.equal(reversed.ok, false);
    if (!reversed.ok) {
      assert.equal(reversed.error, "end-before-start");
    }

    const invalid = validateTravelDates(
      { travelStartDate: "2027-02-30" },
      "2026-10-20",
    );
    assert.equal(invalid.ok, false);
    if (!invalid.ok) {
      assert.equal(invalid.error, "invalid-start");
    }

    const past = validateTravelDates(
      { travelStartDate: "2026-10-19" },
      "2026-10-20",
    );
    assert.equal(past.ok, false);
    if (!past.ok) {
      assert.equal(past.error, "start-in-past");
    }
  });

  it("formats an unambiguous travel period for email", () => {
    assert.equal(
      formatTravelPeriodForEmail(
        {
          travelStartDate: "2027-03-15",
          travelEndDate: "2027-03-22",
        },
        "bg",
      ),
      "2027-03-15 – 2027-03-22",
    );
    assert.equal(
      formatTravelPeriodForEmail({ datesFlexible: true }, "bg"),
      "Датите са гъвкави / още не са уточнени",
    );
    assert.equal(
      formatTravelPeriodForEmail(
        { travelStartDate: "2027-03-15", datesFlexible: false },
        "en",
      ),
      "From 2027-03-15 (end date not set)",
    );
    assert.equal(
      formatTravelPeriodForEmail(
        { travelEndDate: "2027-03-22", datesFlexible: false },
        "en",
      ),
      "Until 2027-03-22 (start date not set)",
    );
    assert.ok(compareIsoDates(parseIsoDate("2027-03-15")!, parseIsoDate("2027-03-22")!) < 0);
  });
});
