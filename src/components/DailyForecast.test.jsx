import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DailyForecast from "./DailyForecast.jsx";
import HourlyStrip from "./HourlyStrip.jsx";
import Nowcast from "./Nowcast.jsx";
import { buildWeather } from "../test/helpers.jsx";

let weather;
beforeAll(async () => {
  weather = await buildWeather();
});

describe("DailyForecast", () => {
  it("labels the first row Today and the rest by weekday", () => {
    render(<DailyForecast weather={weather} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    // Every remaining row carries a short weekday name.
    const rows = document.querySelectorAll(".daily__row");
    expect(rows.length).toBe(weather.days.length);
    expect(rows[1].querySelector(".daily__day").textContent).toMatch(
      /Mon|Tue|Wed|Thu|Fri|Sat|Sun/
    );
  });

  it("titles itself with the actual number of days", () => {
    render(<DailyForecast weather={weather} />);
    expect(
      screen.getByText(`${weather.days.length}-day forecast`)
    ).toBeInTheDocument();
  });

  it("renders nothing without daily data", () => {
    const { container } = render(<DailyForecast weather={{ ...weather, days: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("HourlyStrip", () => {
  it("marks the first column Now and renders 24 hours", () => {
    render(<HourlyStrip weather={weather} />);
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(document.querySelectorAll(".hourly__item")).toHaveLength(24);
  });

  it("renders nothing without hourly data", () => {
    const { container } = render(<HourlyStrip weather={{ ...weather, hours: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Nowcast", () => {
  it("summarises upcoming precipitation", () => {
    render(<Nowcast weather={weather} />);
    expect(screen.getByLabelText(/precipitation nowcast/i)).toBeInTheDocument();
    expect(document.querySelector(".nowcast__headline").textContent).toMatch(
      /starting|stopping|no precipitation|dry|continuing/i
    );
  });

  it("renders nothing without a minutely series", () => {
    const { container } = render(<Nowcast weather={{ ...weather, minutely: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
