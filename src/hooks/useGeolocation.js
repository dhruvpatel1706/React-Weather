import { useCallback, useState } from "react";
import { reverseGeocode } from "../lib/api.js";

const MESSAGES = {
  1: "Location permission denied.",
  2: "Your location is unavailable right now.",
  3: "Timed out finding your location.",
};

export function useGeolocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  const locate = useCallback(() => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const message = "Geolocation isn't supported by this browser.";
      setError(message);
      return Promise.reject(new Error(message));
    }

    setLocating(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            resolve(await reverseGeocode(latitude, longitude));
          } catch (cause) {
            setError("Could not resolve your location.");
            reject(cause);
          } finally {
            setLocating(false);
          }
        },
        (cause) => {
          const message =
            MESSAGES[cause.code] ?? "Could not get your location.";
          setError(message);
          setLocating(false);
          reject(new Error(message));
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, []);

  return { locate, locating, error };
}
