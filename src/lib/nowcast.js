import { parseLocalIso } from "./format.js";

const WET = 0.05; // mm per 15-minute bucket that counts as "raining"

/**
 * Turn 15-minute precipitation buckets into a Dark-Sky-style sentence:
 * "Rain starting in about 20 minutes", "Rain stopping in about 45 minutes",
 * or a plain all-clear.
 *
 * @returns {{ headline: string, detail: string, active: boolean,
 *             buckets: Array, hasData: boolean } | null}
 */
export function buildNowcast(weather) {
  const buckets = weather?.minutely ?? [];
  if (!buckets.length) return null;

  const now = weather.current?.time
    ? parseLocalIso(weather.current.time).getTime()
    : parseLocalIso(buckets[0].time).getTime();

  const series = buckets.map((bucket) => ({
    ...bucket,
    minutes: Math.round(
      (parseLocalIso(bucket.time).getTime() - now) / 60000
    ),
  }));

  const upcoming = series.filter((bucket) => bucket.minutes >= -15);
  if (!upcoming.length) return null;

  const rainingNow = (upcoming[0]?.precipitation ?? 0) >= WET;
  const peak = Math.max(...upcoming.map((b) => b.precipitation ?? 0));

  if (rainingNow) {
    const clearIndex = upcoming.findIndex(
      (bucket) => bucket.minutes > 0 && (bucket.precipitation ?? 0) < WET
    );
    if (clearIndex === -1) {
      return {
        headline: "Precipitation continuing",
        detail: "No let-up in the next 12 hours.",
        active: true,
        buckets: upcoming,
        hasData: true,
      };
    }
    const minutes = upcoming[clearIndex].minutes;
    return {
      headline: `Stopping in about ${roundMinutes(minutes)} min`,
      detail: `Currently ${intensity(peak)}.`,
      active: true,
      buckets: upcoming,
      hasData: true,
    };
  }

  const startIndex = upcoming.findIndex(
    (bucket) => bucket.minutes > 0 && (bucket.precipitation ?? 0) >= WET
  );

  if (startIndex === -1) {
    return {
      headline: "No precipitation expected",
      detail: "Nothing on the radar for the next 12 hours.",
      active: false,
      buckets: upcoming,
      hasData: true,
    };
  }

  const minutes = upcoming[startIndex].minutes;
  const level = intensity(
    Math.max(
      ...upcoming
        .slice(startIndex, startIndex + 8)
        .map((b) => b.precipitation ?? 0)
    )
  );

  if (minutes > 120) {
    return {
      headline: "Dry for now",
      detail: `Next precipitation in about ${Math.round(minutes / 60)} hours.`,
      active: false,
      buckets: upcoming,
      hasData: true,
    };
  }

  return {
    headline: `Starting in about ${roundMinutes(minutes)} min`,
    detail: `Expect ${level}.`,
    active: false,
    buckets: upcoming,
    hasData: true,
  };
}

function roundMinutes(minutes) {
  if (minutes <= 5) return 5;
  return Math.round(minutes / 5) * 5;
}

function intensity(mm) {
  if (mm >= 2.5) return "heavy precipitation";
  if (mm >= 1) return "moderate precipitation";
  if (mm >= 0.25) return "light precipitation";
  return "a light sprinkle";
}

export { WET };
