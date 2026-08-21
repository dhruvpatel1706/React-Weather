import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Hero, { compareToYesterday } from "./Hero.jsx";
import { buildWeather } from "../test/helpers.jsx";

let weather;
beforeAll(async () => {
  weather = await buildWeather();
});

const noop = () => {};

describe("Hero", () => {
  it("shows the place, temperature and condition", () => {
    render(
      <Hero
        weather={weather}
        saved={false}
        onToggleSave={noop}
        onRefresh={noop}
      />
    );
    expect(screen.getByRole("heading", { name: "London" })).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    // "Light rain" appears twice: as the condition line and as the icon's
    // accessible title. Assert on each deliberately.
    expect(screen.getByRole("img", { name: "Light rain" })).toBeInTheDocument();
    expect(document.querySelector(".hero__condition")).toHaveTextContent(
      "Light rain"
    );
  });

  it("labels the save control by state", async () => {
    const onToggleSave = vi.fn();
    const { rerender } = render(
      <Hero
        weather={weather}
        saved={false}
        onToggleSave={onToggleSave}
        onRefresh={noop}
      />
    );
    const save = screen.getByRole("button", { name: /save this city/i });
    expect(save).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(save);
    expect(onToggleSave).toHaveBeenCalledTimes(1);

    rerender(
      <Hero
        weather={weather}
        saved
        onToggleSave={onToggleSave}
        onRefresh={noop}
      />
    );
    expect(
      screen.getByRole("button", { name: /remove from saved/i })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("disables refresh while a refresh is in flight", () => {
    render(
      <Hero
        weather={weather}
        saved={false}
        onToggleSave={noop}
        onRefresh={noop}
        refreshing
      />
    );
    expect(screen.getByRole("button", { name: /refresh/i })).toBeDisabled();
  });

  it("announces stale data when offline", () => {
    render(
      <Hero
        weather={weather}
        saved={false}
        onToggleSave={noop}
        onRefresh={noop}
        stale
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent(/offline/i);
  });
});

describe("compareToYesterday", () => {
  it("describes a warmer day", () => {
    expect(compareToYesterday({ max: 21 }, { max: 18 })).toBe(
      "3° warmer than yesterday."
    );
  });

  it("describes a cooler day", () => {
    expect(compareToYesterday({ max: 14 }, { max: 19 })).toBe(
      "5° cooler than yesterday."
    );
  });

  it("describes an unchanged day", () => {
    expect(compareToYesterday({ max: 18 }, { max: 18.2 })).toBe(
      "About the same as yesterday."
    );
  });

  it("says nothing without yesterday's data", () => {
    expect(compareToYesterday({ max: 18 }, null)).toBe("");
  });
});
