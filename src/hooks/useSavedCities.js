import { useCallback, useEffect, useState } from "react";
import { loadCities, saveCities } from "../lib/storage.js";

const LIMIT = 8;

export function useSavedCities() {
  const [cities, setCities] = useState(loadCities);

  useEffect(() => {
    saveCities(cities);
  }, [cities]);

  const isSaved = useCallback(
    (place) => place != null && cities.some((city) => city.id === place.id),
    [cities]
  );

  const toggle = useCallback((place) => {
    if (!place) return;
    setCities((current) => {
      const exists = current.some((city) => city.id === place.id);
      if (exists) return current.filter((city) => city.id !== place.id);
      return [place, ...current].slice(0, LIMIT);
    });
  }, []);

  const remove = useCallback((id) => {
    setCities((current) => current.filter((city) => city.id !== id));
  }, []);

  return { cities, isSaved, toggle, remove, limit: LIMIT };
}
