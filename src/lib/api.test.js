import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWeather, searchCities, reverseGeocode } from "./api.js";
import {
  PLACE,
  forecastResponse,
  airQualityResponse,
  geocodeResponse,
} from "../test/fixtures.js";

function mockFetch(handler) {
  globalThis.fetch = vi.fn((url) => Promise.resolve(handler(String(url))));
}

const ok = (body) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  mockFetch((url) => {
    if (url.includes("geocoding-api")) return ok(geocodeResponse());
    if (url.includes("air-quality-api")) return ok(airQualityResponse());
    if (url.includes("bigdatacloud")) {
      return ok({
        city: "London",
        countryName: "United Kingdom",
        countryCode: "GB",
      });
    }
    return ok(forecastResponse());
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchCities", () => {
  it("maps geocoder results to places", async () => {
    const results = await searchCities("London");
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      name: "London",
      country: "United Kingdom",
      admin: "England",
    });
    expect(results[0].id).toBe("51.509,-0.126");
  });

  it("short-circuits queries under two characters", async () => {
    expect(await searchCities("L")).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns an empty list when the geocoder finds nothing", async () => {
    mockFetch(() => ok({}));
    expect(await searchCities("Zzzzz")).toEqual([]);
  });
});

describe("fetchWeather", () => {
  it("normalises current conditions", async () => {
    const weather = await fetchWeather(PLACE);
    expect(weather.current).toMatchObject({
      temperature: 18.4,
      humidity: 72,
      windSpeed: 17.3,
      windDirection: 232,
      dewPoint: 13.2,
      isDay: true,
    });
    expect(weather.timezone).toBe("Europe/London");
  });

  it("drops past days so index 0 is today, and exposes yesterday separately", async () => {
    const weather = await fetchWeather(PLACE);
    expect(weather.days[0].date).toBe("2026-08-21");
    expect(weather.yesterday.date).toBe("2026-08-20");
  });

  it("returns 24 hours forward from now, and 48 for the trend", async () => {
    const weather = await fetchWeather(PLACE);
    expect(weather.hours).toHaveLength(24);
    expect(weather.trendHours).toHaveLength(48);
    // The strip starts at the current hour, not at midnight.
    expect(weather.hours[0].time).toBe("2026-08-21T14:00");
  });

  it("includes the minutely nowcast series", async () => {
    const weather = await fetchWeather(PLACE);
    expect(weather.minutely.length).toBeGreaterThan(0);
    expect(weather.minutely[0]).toHaveProperty("precipitation");
  });

  it("attaches air quality and pollen", async () => {
    const weather = await fetchWeather(PLACE);
    expect(weather.air.europeanAqi).toBe(34);
    expect(weather.air.pollen.map((p) => p.key)).toContain("grass");
    // Zero-count species are dropped by the UI, but present here.
    expect(weather.air.pollen.length).toBeGreaterThan(0);
  });

  it("still resolves when air quality fails", async () => {
    mockFetch((url) => {
      if (url.includes("air-quality-api")) throw new Error("down");
      return ok(forecastResponse());
    });
    const weather = await fetchWeather(PLACE);
    expect(weather.air).toBeNull();
    expect(weather.current.temperature).toBe(18.4);
  });

  it("requests imperial units when asked", async () => {
    await fetchWeather(PLACE, { units: "imperial" });
    const requested = globalThis.fetch.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.includes("/v1/forecast"));
    expect(requested).toContain("temperature_unit=fahrenheit");
    expect(requested).toContain("wind_speed_unit=mph");
  });

  it("surfaces a readable error on an HTTP failure", async () => {
    mockFetch(() => ({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    }));
    await expect(fetchWeather(PLACE)).rejects.toThrow(/503/);
  });
});

describe("reverseGeocode", () => {
  it("names the coordinates", async () => {
    const place = await reverseGeocode(51.5, -0.12);
    expect(place.name).toBe("London");
    expect(place.country).toBe("United Kingdom");
  });

  it("falls back to a generic label when the lookup fails", async () => {
    mockFetch(() => {
      throw new Error("offline");
    });
    const place = await reverseGeocode(51.5, -0.12);
    expect(place.name).toBe("My Location");
    expect(place.latitude).toBe(51.5);
  });
});
