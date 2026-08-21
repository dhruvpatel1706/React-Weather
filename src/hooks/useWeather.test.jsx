import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWeather } from "./useWeather.js";
import {
  PLACE,
  forecastResponse,
  airQualityResponse,
} from "../test/fixtures.js";
import { saveLastWeather } from "../lib/storage.js";

const ok = (body) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  globalThis.fetch = vi.fn((url) =>
    Promise.resolve(
      String(url).includes("air-quality")
        ? ok(airQualityResponse())
        : ok(forecastResponse())
    )
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useWeather", () => {
  it("loads weather for a place", async () => {
    const { result } = renderHook(() => useWeather(PLACE, "metric"));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.weather.current.temperature).toBe(18.4);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error when the request fails and nothing is cached", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );
    const { result } = renderHook(() => useWeather(PLACE, "metric"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toMatch(/500/);
  });

  it("falls back to the cached reading and flags it stale", async () => {
    // Seed the cache with a previous successful reading for this place.
    saveLastWeather({
      place: PLACE,
      current: { temperature: 11.1, code: 0, isDay: true },
      days: [],
      hours: [],
      fetchedAt: Date.now(),
    });
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("offline")));

    const { result } = renderHook(() => useWeather(PLACE, "metric"));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.stale).toBe(true);
    expect(result.current.weather.current.temperature).toBe(11.1);
  });

  it("refetches when the units change", async () => {
    const { result, rerender } = renderHook(
      ({ units }) => useWeather(PLACE, units),
      { initialProps: { units: "metric" } }
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    const before = globalThis.fetch.mock.calls.length;

    rerender({ units: "imperial" });
    await waitFor(() =>
      expect(globalThis.fetch.mock.calls.length).toBeGreaterThan(before)
    );
  });

  it("refreshes without clearing the current reading", async () => {
    const { result } = renderHook(() => useWeather(PLACE, "metric"));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.weather).not.toBeNull();
    expect(result.current.status).toBe("ready");
  });
});
