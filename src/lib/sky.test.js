import { describe, expect, it } from "vitest";
import { PALETTES, dayPhase, skyPalette, skyVariables } from "./sky.js";

const at = (time, code = 0, isDay = true) => ({
  current: { code, isDay, time },
  days: [{ sunrise: "2026-08-21T06:30", sunset: "2026-08-21T19:30" }],
});

describe("dayPhase", () => {
  it("detects midday and midnight", () => {
    expect(dayPhase(at("2026-08-21T12:00"))).toBe("day");
    expect(dayPhase(at("2026-08-21T02:00", 0, false))).toBe("night");
  });

  it("detects the hour around sunrise and sunset", () => {
    expect(dayPhase(at("2026-08-21T06:45"))).toBe("dawn");
    expect(dayPhase(at("2026-08-21T19:00"))).toBe("dusk");
  });

  it("falls back to the is_day flag without sun times", () => {
    expect(dayPhase({ current: { code: 0, isDay: false, time: "x" }, days: [] })).toBe(
      "night"
    );
  });
});

const STOPS = ["zenith", "upper", "lower", "horizon", "light"];
const isHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value);

describe("skyPalette", () => {
  it("gives a full set of colour stops plus a grade", () => {
    const palette = skyPalette(at("2026-08-21T12:00"));
    for (const stop of STOPS) {
      expect(isHex(palette[stop])).toBe(true);
    }
    expect(typeof palette.grade).toBe("string");
  });

  it("emits only valid hex across every palette", () => {
    // Guards against a mistyped colour silently breaking a whole condition.
    for (const [key, palette] of Object.entries(PALETTES)) {
      for (const stop of STOPS) {
        expect(isHex(palette[stop]), `${key}.${stop} = ${palette[stop]}`).toBe(true);
      }
    }
  });

  it("differs between day and night for the same condition", () => {
    expect(skyPalette(at("2026-08-21T12:00", 0, true))).not.toEqual(
      skyPalette(at("2026-08-21T23:00", 0, false))
    );
  });

  it("falls back to a valid palette for conditions with no dusk variant", () => {
    // Snow has only day/night entries; dusk must still resolve.
    const palette = skyPalette(at("2026-08-21T19:00", 73, true));
    expect(STOPS.every((stop) => isHex(palette[stop]))).toBe(true);
  });

  it("uses the neutral fallback with no data", () => {
    const palette = skyPalette(null);
    expect(STOPS.every((stop) => isHex(palette[stop]))).toBe(true);
  });
});

describe("skyVariables", () => {
  it("emits every custom property the stylesheet consumes", () => {
    const vars = skyVariables(at("2026-08-21T12:00"));
    for (const name of [
      "--sky-zenith",
      "--sky-upper",
      "--sky-lower",
      "--sky-horizon",
      "--sky-light",
      "--sky-grade",
    ]) {
      expect(vars[name]).toBeTruthy();
    }
  });

  it("keeps the flat --sky-1..3 aliases for the pre-mount paint", () => {
    const vars = skyVariables(at("2026-08-21T12:00"));
    expect(isHex(vars["--sky-1"])).toBe(true);
    expect(isHex(vars["--sky-3"])).toBe(true);
  });
});
