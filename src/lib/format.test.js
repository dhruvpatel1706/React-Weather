import { describe, expect, it } from "vitest";
import {
  aqiDescriptor,
  compassDirection,
  degrees,
  distanceFrom,
  formatDayName,
  formatFullDate,
  formatTime,
  parseLocalIso,
  placeLabel,
  pressureDescriptor,
  speedUnit,
  tempUnit,
  uvDescriptor,
} from "./format.js";

describe("degrees", () => {
  it("rounds and appends the symbol", () => {
    expect(degrees(18.4)).toBe("18°");
    expect(degrees(-0.6)).toBe("-1°");
  });

  it("renders a placeholder for missing values", () => {
    expect(degrees(null)).toBe("--");
    expect(degrees(undefined)).toBe("--");
    expect(degrees(Number.NaN)).toBe("--");
  });
});

describe("parseLocalIso", () => {
  // Open-Meteo mixes date-only and date-time strings; both must survive.
  it("parses a date-only string", () => {
    expect(parseLocalIso("2026-08-22").toISOString()).toBe(
      "2026-08-22T00:00:00.000Z"
    );
  });

  it("parses a minute-precision local string", () => {
    expect(parseLocalIso("2026-08-21T14:00").toISOString()).toBe(
      "2026-08-21T14:00:00.000Z"
    );
  });

  it("leaves an explicit-offset string alone", () => {
    expect(parseLocalIso("2026-08-21T14:00:00Z").toISOString()).toBe(
      "2026-08-21T14:00:00.000Z"
    );
  });
});

describe("date formatting", () => {
  it("labels the first day Today and others by weekday", () => {
    expect(formatDayName("2026-08-21", "UTC", 0)).toBe("Today");
    expect(formatDayName("2026-08-22", "UTC", 1)).toBe("Sat");
  });

  it("formats a time in the location's zone, not the host's", () => {
    expect(formatTime("2026-08-21T14:00", "UTC")).toMatch(/2:00/);
  });

  it("formats a full date", () => {
    expect(formatFullDate("2026-08-21T14:00", "UTC")).toContain("August");
  });

  it("degrades to a placeholder on bad input", () => {
    expect(formatTime(null, "UTC")).toBe("--");
    expect(formatDayName("nonsense", "UTC", 3)).toBe("--");
  });
});

describe("units", () => {
  it("switches labels", () => {
    expect(tempUnit("metric")).toBe("°C");
    expect(tempUnit("imperial")).toBe("°F");
    expect(speedUnit("metric")).toBe("km/h");
    expect(speedUnit("imperial")).toBe("mph");
  });

  it("converts visibility", () => {
    expect(distanceFrom(24000, "metric")).toBe("24.0 km");
    expect(distanceFrom(1609.34, "imperial")).toBe("1.0 mi");
    expect(distanceFrom(null, "metric")).toBe("--");
  });
});

describe("descriptors", () => {
  it("bands the UV index", () => {
    expect(uvDescriptor(1).label).toBe("Low");
    expect(uvDescriptor(5).label).toBe("Moderate");
    expect(uvDescriptor(7).label).toBe("High");
    expect(uvDescriptor(9).label).toBe("Very High");
    expect(uvDescriptor(12).label).toBe("Extreme");
    expect(uvDescriptor(null).label).toBe("--");
  });

  it("bands air quality", () => {
    expect(aqiDescriptor(15).label).toBe("Good");
    expect(aqiDescriptor(95).label).toBe("Very Poor");
  });

  it("bands pressure", () => {
    expect(pressureDescriptor(990)).toBe("Low");
    expect(pressureDescriptor(1013)).toBe("Normal");
    expect(pressureDescriptor(1030)).toBe("High");
  });

  it("maps bearings to compass points", () => {
    expect(compassDirection(0)).toBe("N");
    expect(compassDirection(90)).toBe("E");
    expect(compassDirection(232)).toBe("SW");
    expect(compassDirection(359)).toBe("N");
  });
});

describe("placeLabel", () => {
  it("joins name and country, skipping blanks", () => {
    expect(placeLabel({ name: "London", country: "United Kingdom" })).toBe(
      "London, United Kingdom"
    );
    expect(placeLabel({ name: "Somewhere", country: "" })).toBe("Somewhere");
    expect(placeLabel(null)).toBe("");
  });
});
