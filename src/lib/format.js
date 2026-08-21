/** Formatting helpers. All date/number work uses Intl — no date library. */

export function degrees(value) {
  if (value == null || Number.isNaN(value)) return "--";
  return `${Math.round(value)}°`;
}

export function tempUnit(units) {
  return units === "imperial" ? "°F" : "°C";
}

export function speedUnit(units) {
  return units === "imperial" ? "mph" : "km/h";
}

export function distanceFrom(metres, units) {
  if (metres == null) return "--";
  return units === "imperial"
    ? `${(metres / 1609.34).toFixed(1)} mi`
    : `${(metres / 1000).toFixed(1)} km`;
}

/** Format an Open-Meteo local-time string in the *location's* timezone. */
export function formatTime(iso, timezone, options = {}) {
  if (!iso) return "--";
  const date = parseLocalIso(iso);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    ...options,
  }).format(date);
}

export function formatHour(iso, timezone) {
  return formatTime(iso, timezone, { hour: "numeric", minute: undefined });
}

export function formatDayName(iso, timezone, index) {
  if (index === 0) return "Today";
  const date = parseLocalIso(iso);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: timezone,
  }).format(date);
}

export function formatFullDate(iso, timezone) {
  if (!iso) return "";
  const date = parseLocalIso(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(date);
}

/**
 * Open-Meteo returns wall-clock strings already in the location's timezone,
 * either as a date ("2026-08-21") or a date-time ("2026-08-21T14:00").
 * Normalising both to a UTC instant and formatting back in that same zone
 * round-trips the wall clock without the host timezone interfering.
 */
function parseLocalIso(iso) {
  if (typeof iso !== "string") return new Date(iso);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(`${iso}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) return new Date(`${iso}:00Z`);
  if (/Z$|[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso);
  return new Date(`${iso}Z`);
}

export { parseLocalIso };

export function placeLabel(place) {
  if (!place) return "";
  return [place.name, place.country].filter(Boolean).join(", ");
}

export function compassDirection(degreesValue) {
  if (degreesValue == null) return "--";
  const points = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return points[Math.round(degreesValue / 22.5) % 16];
}

export function uvDescriptor(uv) {
  if (uv == null) return { label: "--", level: "low" };
  if (uv < 3) return { label: "Low", level: "low" };
  if (uv < 6) return { label: "Moderate", level: "moderate" };
  if (uv < 8) return { label: "High", level: "high" };
  if (uv < 11) return { label: "Very High", level: "very-high" };
  return { label: "Extreme", level: "extreme" };
}

export function aqiDescriptor(aqi) {
  if (aqi == null) return { label: "--", level: "low" };
  if (aqi <= 20) return { label: "Good", level: "low" };
  if (aqi <= 40) return { label: "Fair", level: "moderate" };
  if (aqi <= 60) return { label: "Moderate", level: "high" };
  if (aqi <= 80) return { label: "Poor", level: "very-high" };
  return { label: "Very Poor", level: "extreme" };
}

export function pressureDescriptor(hpa) {
  if (hpa == null) return "--";
  if (hpa < 1000) return "Low";
  if (hpa > 1020) return "High";
  return "Normal";
}

export function humidityDescriptor(humidity) {
  if (humidity == null) return "";
  if (humidity < 30) return "Dry air";
  if (humidity > 70) return "Feels muggy";
  return "Comfortable";
}
