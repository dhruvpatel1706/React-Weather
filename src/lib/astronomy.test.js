import { describe, expect, it } from "vitest";
import { daylightDelta, formatDuration, moonPhase } from "./astronomy.js";

describe("moonPhase", () => {
  // Checked against published lunar calendars.
  it("identifies a known new moon", () => {
    expect(moonPhase(new Date("2024-01-11T12:00:00Z")).name).toBe("New Moon");
  });

  it("identifies a known full moon", () => {
    expect(moonPhase(new Date("2024-01-25T12:00:00Z")).name).toBe("Full Moon");
  });

  it("reports illumination between 0 and 1", () => {
    const { illumination } = moonPhase(new Date("2026-08-21T12:00:00Z"));
    expect(illumination).toBeGreaterThanOrEqual(0);
    expect(illumination).toBeLessThanOrEqual(1);
  });

  it("keeps the phase fraction inside the cycle", () => {
    const { phase } = moonPhase(new Date("1970-01-01T00:00:00Z"));
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(1);
  });
});

describe("formatDuration", () => {
  it("renders hours and minutes", () => {
    expect(formatDuration(48240)).toBe("13h 24m");
    expect(formatDuration(3600)).toBe("1h 0m");
  });

  it("handles missing input", () => {
    expect(formatDuration(null)).toBe("--");
  });
});

describe("daylightDelta", () => {
  it("returns signed minutes", () => {
    expect(daylightDelta(48240, 47940)).toBe(5);
    expect(daylightDelta(47940, 48240)).toBe(-5);
    expect(daylightDelta(null, 100)).toBeNull();
  });
});
