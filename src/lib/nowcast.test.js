import { describe, expect, it } from "vitest";
import { buildNowcast } from "./nowcast.js";

/** Builds a weather object whose minutely series has the given mm values. */
function withBuckets(values) {
  return {
    current: { time: "2026-08-21T12:00" },
    minutely: values.map((precipitation, index) => {
      const minutes = index * 15;
      const hour = 12 + Math.floor(minutes / 60);
      return {
        time: `2026-08-21T${String(hour).padStart(2, "0")}:${String(
          minutes % 60
        ).padStart(2, "0")}`,
        precipitation,
        code: precipitation > 0 ? 61 : 2,
      };
    }),
  };
}

describe("buildNowcast", () => {
  it("returns null without a minutely series", () => {
    expect(buildNowcast({ current: {}, minutely: [] })).toBeNull();
    expect(buildNowcast(null)).toBeNull();
  });

  it("announces rain starting soon", () => {
    const result = buildNowcast(withBuckets([0, 0, 0, 0.4, 1.2, 0.8]));
    expect(result.headline).toBe("Starting in about 45 min");
    expect(result.active).toBe(false);
  });

  it("announces rain stopping when it is already raining", () => {
    const result = buildNowcast(withBuckets([0.9, 0.5, 0, 0, 0]));
    expect(result.headline).toBe("Stopping in about 30 min");
    expect(result.active).toBe(true);
  });

  it("reports an all-clear when nothing is coming", () => {
    const result = buildNowcast(withBuckets([0, 0, 0, 0, 0]));
    expect(result.headline).toBe("No precipitation expected");
    expect(result.active).toBe(false);
  });

  it("reports continuous precipitation with no break", () => {
    const result = buildNowcast(withBuckets([1, 1, 1, 1, 1]));
    expect(result.headline).toBe("Precipitation continuing");
    expect(result.active).toBe(true);
  });

  it("switches to an hours-away phrasing when rain is far off", () => {
    // Dry for nine hours (36 buckets), then rain.
    const values = Array(36).fill(0).concat([1.5, 1.5]);
    const result = buildNowcast(withBuckets(values));
    expect(result.headline).toBe("Dry for now");
    expect(result.detail).toMatch(/9 hours/);
  });

  it("describes intensity from the peak rate", () => {
    expect(buildNowcast(withBuckets([0, 0, 3.0])).detail).toMatch(/heavy/);
    expect(buildNowcast(withBuckets([0, 0, 0.1])).detail).toMatch(/sprinkle/);
  });
});
