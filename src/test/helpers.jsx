import { fetchWeather } from "../lib/api.js";
import { PLACE, forecastResponse, airQualityResponse } from "./fixtures.js";
import { vi } from "vitest";

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
