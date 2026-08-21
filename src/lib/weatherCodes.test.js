import { describe, expect, it } from "vitest";
import {
  SCENE,
  describeWeather,
  recommendation,
  weatherIcon,
  weatherLabel,
  weatherScene,
} from "./weatherCodes.js";

describe("weather codes", () => {
  it("maps known WMO codes", () => {
    expect(weatherLabel(0)).toBe("Clear sky");
    expect(weatherLabel(95)).toBe("Thunderstorm");
    expect(weatherScene(71)).toBe(SCENE.SNOW);
    expect(weatherIcon(45)).toBe("fog");
  });

  it("falls back safely for an unknown code", () => {
    expect(weatherLabel(4242)).toBe("Unknown");
    expect(weatherScene(4242)).toBe(SCENE.CLOUDS);
    expect(describeWeather(4242).icon).toBe("cloudy");
  });

  it("gives day and night variants of the recommendation", () => {
    expect(recommendation(0, true)).not.toBe(recommendation(0, false));
    expect(recommendation(0, true)).toMatch(/Sunglasses/);
  });
});
