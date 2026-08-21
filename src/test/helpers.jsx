import { fetchWeather } from "../lib/api.js";
import { PLACE, forecastResponse, airQualityResponse } from "./fixtures.js";
import { vi } from "vitest";

/**
 * Builds a fully normalised weather object from the fixtures, by running it
 * through the real api.js normaliser. Component tests then exercise the same
 * shape the app actually receives, rather than a hand-written approximation
 * that can drift from it.
 */
export async function buildWeather(overrides = {}) {
  const original = globalThis.fetch;
  globalThis.fetch = vi.fn((url) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve(
          String(url).includes("air-quality")
            ? airQualityResponse()
            : forecastResponse(overrides)
        ),
    })
  );
  try {
    return await fetchWeather(PLACE, { units: overrides.units ?? "metric" });
  } finally {
    globalThis.fetch = original;
  }
}
