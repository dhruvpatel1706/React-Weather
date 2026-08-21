import { describe, expect, it } from "vitest";
import { placeFromUrl, urlForPlace } from "./url.js";

const LONDON = {
  name: "London",
  country: "United Kingdom",
  latitude: 51.5085,
  longitude: -0.1257,
};

describe("placeFromUrl", () => {
  it("reads a shared location", () => {
    const place = placeFromUrl("?lat=51.5085&lon=-0.1257&name=London&country=UK");
    expect(place).toMatchObject({
      name: "London",
      country: "UK",
      latitude: 51.5085,
      longitude: -0.1257,
    });
  });

  it("returns null without usable coordinates", () => {
    expect(placeFromUrl("?name=London")).toBeNull();
    expect(placeFromUrl("?lat=abc&lon=def")).toBeNull();
    expect(placeFromUrl("")).toBeNull();
  });

  it("falls back to a generic name", () => {
    expect(placeFromUrl("?lat=1&lon=2").name).toBe("Shared location");
  });
});

describe("urlForPlace", () => {
  it("builds a shareable link", () => {
    const url = urlForPlace(LONDON, "https://example.com/app");
    expect(url).toContain("lat=51.5085");
    expect(url).toContain("lon=-0.1257");
    expect(url).toContain("name=London");
    expect(url).toContain("country=United+Kingdom");
  });

  it("round-trips through placeFromUrl", () => {
    const url = urlForPlace(LONDON, "https://example.com/app");
    const place = placeFromUrl(url.slice(url.indexOf("?")));
    expect(place.name).toBe("London");
    expect(place.latitude).toBeCloseTo(51.5085, 3);
  });
});
