import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWeather } from "../lib/api.js";
import { loadLastWeather, saveLastWeather } from "../lib/storage.js";

/**
 * Fetches weather for a place, keeping the previously rendered data visible
 * while a refresh is in flight so the layout never collapses to a spinner.
 * Falls back to the cached last-known reading when the network fails.
 */
export function useWeather(place, units) {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const controllerRef = useRef(null);

  const load = useCallback(
    async (target, targetUnits, { silent = false } = {}) => {
      if (!target) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus(silent ? "refreshing" : "loading");
      setError(null);

      try {
        const data = await fetchWeather(target, {
          signal: controller.signal,
          units: targetUnits,
        });
        if (controller.signal.aborted) return;
        setWeather(data);
        setStale(false);
        setStatus("ready");
        saveLastWeather(data);
      } catch (cause) {
        if (cause.name === "AbortError") return;
        setError(cause.message || "Something went wrong.");

        // Offline or the service is down: show the last good reading, marked stale.
        const cached = loadLastWeather();
        if (cached && cached.place?.id === target.id) {
          setWeather(cached);
          setStale(true);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      }
    },
    []
  );

  useEffect(() => {
    load(place, units);
    return () => controllerRef.current?.abort();
  }, [place, units, load]);

  const refresh = useCallback(
    () => load(place, units, { silent: true }),
    [load, place, units]
  );

  return { weather, status, error, stale, refresh };
}
