import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSavedCities } from "./useSavedCities.js";

const city = (id, name) => ({ id, name, latitude: 1, longitude: 2 });

describe("useSavedCities", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useSavedCities());
    expect(result.current.cities).toEqual([]);
  });

  it("adds and removes by toggling", () => {
    const { result } = renderHook(() => useSavedCities());

    act(() => result.current.toggle(city("a", "Lisbon")));
    expect(result.current.cities).toHaveLength(1);
    expect(result.current.isSaved(city("a", "Lisbon"))).toBe(true);

    act(() => result.current.toggle(city("a", "Lisbon")));
    expect(result.current.cities).toEqual([]);
  });

  it("puts the newest city first", () => {
    const { result } = renderHook(() => useSavedCities());
    act(() => result.current.toggle(city("a", "Lisbon")));
    act(() => result.current.toggle(city("b", "Oslo")));
    expect(result.current.cities.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("caps the list at the limit, dropping the oldest", () => {
    const { result } = renderHook(() => useSavedCities());
    const limit = result.current.limit;

    for (let i = 0; i < limit + 3; i += 1) {
      act(() => result.current.toggle(city(`c${i}`, `City ${i}`)));
    }
    expect(result.current.cities).toHaveLength(limit);
    expect(result.current.cities[0].id).toBe(`c${limit + 2}`);
  });

  it("removes by id", () => {
    const { result } = renderHook(() => useSavedCities());
    act(() => result.current.toggle(city("a", "Lisbon")));
    act(() => result.current.remove("a"));
    expect(result.current.cities).toEqual([]);
  });

  it("persists across remounts", () => {
    const first = renderHook(() => useSavedCities());
    act(() => first.result.current.toggle(city("a", "Lisbon")));
    first.unmount();

    const second = renderHook(() => useSavedCities());
    expect(second.result.current.cities.map((c) => c.id)).toEqual(["a"]);
  });

  it("ignores a null place", () => {
    const { result } = renderHook(() => useSavedCities());
    act(() => result.current.toggle(null));
    expect(result.current.cities).toEqual([]);
  });
});
