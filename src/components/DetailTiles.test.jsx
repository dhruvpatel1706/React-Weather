import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DetailTiles, { sunProgress } from "./DetailTiles.jsx";
import { buildWeather } from "../test/helpers.jsx";

let weather;
beforeAll(async () => {
  weather = await buildWeather();
});

describe("DetailTiles", () => {
  it("renders every core reading", () => {
    render(<DetailTiles weather={weather} />);
    for (const label of [
      "UV index",
      "Wind",
      "Sun",
      "Air quality",
      "Humidity",
      "Feels like",
      "Visibility",
      "Pressure",
      "Dew point",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows humidity as a percentage", () => {
    render(<DetailTiles weather={weather} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("renders extra tiles passed as children", () => {
    render(
      <DetailTiles weather={weather}>
        <article>Extra tile</article>
      </DetailTiles>
    );
    expect(screen.getByText("Extra tile")).toBeInTheDocument();
  });

  it("degrades to placeholders when readings are missing", () => {
    const sparse = {
      ...weather,
      current: {
        ...weather.current,
        humidity: null,
        pressure: null,
        visibility: null,
      },
      air: null,
    };
    render(<DetailTiles weather={sparse} />);
    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
  });
});

describe("sunProgress", () => {
  const rise = "2026-08-21T06:00";
  const set = "2026-08-21T20:00";

  it("is 0 at sunrise and 1 at sunset", () => {
    expect(sunProgress(rise, set, rise)).toBe(0);
    expect(sunProgress(rise, set, set)).toBe(1);
  });

  it("is halfway at solar noon", () => {
    expect(sunProgress(rise, set, "2026-08-21T13:00")).toBeCloseTo(0.5, 2);
  });

  it("clamps outside daylight hours", () => {
    expect(sunProgress(rise, set, "2026-08-21T03:00")).toBe(0);
    expect(sunProgress(rise, set, "2026-08-21T23:00")).toBe(1);
  });

  it("returns 0 on missing or nonsensical input", () => {
    expect(sunProgress(null, set, rise)).toBe(0);
    expect(sunProgress(set, rise, rise)).toBe(0);
  });
});
