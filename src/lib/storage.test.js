import { describe, expect, it, vi } from "vitest";
import {
  loadCities,
  saveCities,
  loadUnits,
  saveUnits,
  loadLastWeather,
  saveLastWeather,
} from "./storage.js";

describe("storage", () => {
  it("round-trips saved cities", () => {
    const cities = [{ id: "a", name: "Lisbon" }];
    expect(saveCities(cities)).toBe(true);
    expect(loadCities()).toEqual(cities);
  });

  it("defaults to an empty city list", () => {
    expect(loadCities()).toEqual([]);
  });

  it("recovers from corrupt JSON rather than throwing", () => {
    localStorage.setItem("rw.savedCities.v2", "{not json");
    expect(loadCities()).toEqual([]);
  });

  it("ignores a non-array city payload", () => {
    localStorage.setItem("rw.savedCities.v2", '{"nope":true}');
    expect(loadCities()).toEqual([]);
  });

  it("round-trips units and rejects unknown values", () => {
    saveUnits("imperial");
    expect(loadUnits()).toBe("imperial");
    localStorage.setItem("rw.units.v2", '"klingon"');
    expect(loadUnits()).toBe("metric");
  });

  it("round-trips the last weather reading", () => {
    saveLastWeather({ place: { id: "x" } });
    expect(loadLastWeather()).toEqual({ place: { id: "x" } });
  });

  it("reports failure when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    expect(saveCities([{ id: "a" }])).toBe(false);
  });
});
