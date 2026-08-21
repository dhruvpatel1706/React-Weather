import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar.jsx";
import { geocodeResponse } from "../test/fixtures.js";

beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(geocodeResponse()) })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setup = (props = {}) => {
  const onSelect = vi.fn();
  const onLocate = vi.fn();
  render(<SearchBar onSelect={onSelect} onLocate={onLocate} {...props} />);
  return { onSelect, onLocate, input: screen.getByRole("combobox") };
};

describe("SearchBar", () => {
  it("suggests places once enough has been typed", async () => {
    const { input } = setup();
    await userEvent.type(input, "London");
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("London");
    expect(options[0]).toHaveTextContent("England, United Kingdom");
  });

  it("does not query the geocoder for a single character", async () => {
    const { input } = setup();
    await userEvent.type(input, "L");
    // Let the debounce elapse inside act, so the resulting state update is
    // attributed to React rather than warned about as an escaped update.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("selects a place by click and clears the field", async () => {
    const { onSelect, input } = setup();
    await userEvent.type(input, "London");
    const options = await screen.findAllByRole("option");
    await userEvent.click(options[1]);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "London", country: "Canada" })
    );
    expect(input).toHaveValue("");
  });

  it("supports arrow keys and Enter", async () => {
    const { onSelect, input } = setup();
    await userEvent.type(input, "London");
    await screen.findAllByRole("option");

    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ country: "Canada" })
    );
  });

  it("closes the list on Escape", async () => {
    const { input } = setup();
    await userEvent.type(input, "London");
    await screen.findAllByRole("option");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });
  });

  it("reports when nothing matches", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) })
    );
    const { input } = setup();
    await userEvent.type(input, "Zzzzzz");
    expect(await screen.findByText(/no matching places/i)).toBeInTheDocument();
  });

  it("triggers the geolocation flow", async () => {
    const { onLocate } = setup();
    await userEvent.click(screen.getByRole("button", { name: /use my location/i }));
    expect(onLocate).toHaveBeenCalled();
  });
});
