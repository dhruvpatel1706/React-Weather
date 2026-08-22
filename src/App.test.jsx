import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import {
  forecastResponse,
  airQualityResponse,
  geocodeResponse,
} from "./test/fixtures.js";

const ok = (body) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  globalThis.fetch = vi.fn((url) => {
    const href = String(url);
    if (href.includes("geocoding-api"))
      return Promise.resolve(ok(geocodeResponse()));
    if (href.includes("air-quality-api"))
      return Promise.resolve(ok(airQualityResponse()));
    if (href.includes("bigdatacloud")) {
      return Promise.resolve(
        ok({ city: "London", countryName: "United Kingdom" })
      );
    }
    return Promise.resolve(ok(forecastResponse()));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

async function renderApp() {
  render(<App />);
  await screen.findByRole("heading", { level: 1 }, { timeout: 5000 });
}

describe("App", () => {
  it("renders a reading on load", async () => {
    await renderApp();
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();
    expect(document.querySelectorAll(".tile").length).toBeGreaterThan(0);
  });

  // Regression: these effects used a concise arrow, so the boolean returned by
  // saveUnits became React's cleanup function and the tree crashed on the
  // first units change.
  it("survives switching to Fahrenheit and back", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: "°F" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "°F" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "°C" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "°C" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();
  });

  it("requests imperial units from the API when toggled", async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole("button", { name: "°F" }));

    await waitFor(() => {
      const urls = globalThis.fetch.mock.calls.map(([u]) => String(u));
      expect(urls.some((u) => u.includes("temperature_unit=fahrenheit"))).toBe(
        true
      );
    });
  });

  it("persists the unit choice", async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole("button", { name: "°F" }));
    await waitFor(() => {
      expect(localStorage.getItem("rw.units.v2")).toBe('"imperial"');
    });
  });

  it("survives toggling the theme", async () => {
    const user = userEvent.setup();
    await renderApp();
    const before = document.documentElement.dataset.theme;

    await user.click(
      screen.getByRole("button", { name: /switch to .* theme/i })
    );
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).not.toBe(before);
    });
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();
  });

  it("survives saving and unsaving a city", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: /save this city/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /remove from saved/i })
      ).toBeInTheDocument();
    });
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /remove from saved/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save this city/i })
      ).toBeInTheDocument();
    });
  });

  it("survives keyboard shortcuts for refresh and units", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.keyboard("u");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "°F" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    await user.keyboard("r");
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();
  });

  it("survives expanding a forecast day", async () => {
    const user = userEvent.setup();
    await renderApp();

    const rows = document.querySelectorAll(".daily__row");
    expect(rows.length).toBeGreaterThan(1);
    await user.click(rows[1]);

    await waitFor(() => {
      expect(document.querySelector(".daily__detail")).toBeInTheDocument();
    });
    expect(document.querySelector(".hero__temp")).toBeInTheDocument();
  });
});
