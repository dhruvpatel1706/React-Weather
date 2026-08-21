import { SCENE, weatherScene } from "./weatherCodes.js";
import { parseLocalIso } from "./format.js";

/**
 * Sky palettes.
 *
 * Each entry carries five colours rather than three: a deep zenith, two mid
 * bands, a horizon, and a light colour used for the glow and god rays. The
 * background composites them as overlapping radial gradients (a "mesh"), which
 * produces far softer transitions than a single linear ramp — real skies do
 * not have straight-line gradients.
 *
 * `grade` is a CSS filter applied to the whole sky for per-condition colour
 * grading, the way a film would be graded for a mood.
 */
const PALETTES = {
  [`${SCENE.CLEAR}-day`]: {
    zenith: "#0a4da8",
    upper: "#1a7fd4",
    lower: "#5cb4ec",
    horizon: "#bfe6fb",
    light: "#fff2c4",
    grade: "saturate(1.12) contrast(1.04)",
  },
  [`${SCENE.CLEAR}-dawn`]: {
    zenith: "#1a2a6c",
    upper: "#7b3f8f",
    lower: "#e0658a",
    horizon: "#ffb37a",
    light: "#ffd7a1",
    grade: "saturate(1.2) contrast(1.05)",
  },
  [`${SCENE.CLEAR}-dusk`]: {
    zenith: "#0d1c4d",
    upper: "#4b2a78",
    lower: "#c4517a",
    horizon: "#ff9d5c",
    light: "#ffc48a",
    grade: "saturate(1.22) contrast(1.06)",
  },
  [`${SCENE.CLEAR}-night`]: {
    zenith: "#01030d",
    upper: "#050f2c",
    lower: "#0d2050",
    horizon: "#1b3a70",
    light: "#9fc4ff",
    grade: "saturate(1.05) contrast(1.1)",
  },

  [`${SCENE.CLOUDS}-day`]: {
    zenith: "#2f4c6b",
    upper: "#4a6b8c",
    lower: "#7e9bb5",
    horizon: "#c3d3e0",
    light: "#ffffff",
    grade: "saturate(0.95) contrast(1.02)",
  },
  [`${SCENE.CLOUDS}-dawn`]: {
    zenith: "#2b3660",
    upper: "#5f5680",
    lower: "#a8768a",
    horizon: "#dba98d",
    light: "#ffd9b8",
    grade: "saturate(1.08)",
  },
  [`${SCENE.CLOUDS}-dusk`]: {
    zenith: "#1e2547",
    upper: "#453f66",
    lower: "#7c5c78",
    horizon: "#b98a80",
    light: "#ffc9a5",
    grade: "saturate(1.1)",
  },
  [`${SCENE.CLOUDS}-night`]: {
    zenith: "#03060f",
    upper: "#0a142b",
    lower: "#182642",
    horizon: "#2b3d5c",
    light: "#a8bcd8",
    grade: "saturate(1.02) contrast(1.08)",
  },

  [`${SCENE.RAIN}-day`]: {
    zenith: "#1c2b3c",
    upper: "#2e4257",
    lower: "#4d6478",
    horizon: "#8199ab",
    light: "#d4e6f5",
    grade: "saturate(0.86) contrast(1.06)",
  },
  [`${SCENE.RAIN}-night`]: {
    zenith: "#01040c",
    upper: "#070e1e",
    lower: "#111d33",
    horizon: "#22304a",
    light: "#8fb2d8",
    grade: "saturate(0.82) contrast(1.12)",
  },

  [`${SCENE.DRIZZLE}-day`]: {
    zenith: "#2b3d50",
    upper: "#425568",
    lower: "#66798c",
    horizon: "#9fb0bf",
    light: "#dcecf8",
    grade: "saturate(0.9) contrast(1.04)",
  },
  [`${SCENE.DRIZZLE}-night`]: {
    zenith: "#02050f",
    upper: "#091124",
    lower: "#15223a",
    horizon: "#273750",
    light: "#95b5d8",
    grade: "saturate(0.85) contrast(1.1)",
  },

  [`${SCENE.SNOW}-day`]: {
    zenith: "#3f5a75",
    upper: "#5f7c99",
    lower: "#93b0c8",
    horizon: "#dcebf7",
    light: "#ffffff",
    grade: "saturate(0.92) brightness(1.04)",
  },
  [`${SCENE.SNOW}-night`]: {
    zenith: "#040a1a",
    upper: "#0d182f",
    lower: "#1e2f4c",
    horizon: "#38506e",
    light: "#cfe2ff",
    grade: "saturate(0.9) contrast(1.08)",
  },

  [`${SCENE.FOG}-day`]: {
    zenith: "#4a555f",
    upper: "#6b757e",
    lower: "#949da5",
    horizon: "#c9d0d6",
    light: "#ffffff",
    grade: "saturate(0.7) contrast(0.96)",
  },
  [`${SCENE.FOG}-night`]: {
    zenith: "#06090e",
    upper: "#111820",
    lower: "#212a34",
    horizon: "#39434e",
    light: "#b8c4d0",
    grade: "saturate(0.68) contrast(1.04)",
  },

  [`${SCENE.THUNDER}-day`]: {
    zenith: "#12172a",
    upper: "#232a44",
    lower: "#3b3f5f",
    horizon: "#5c5f7d",
    light: "#c9c0ff",
    grade: "saturate(0.9) contrast(1.14)",
  },
  [`${SCENE.THUNDER}-night`]: {
    zenith: "#000208",
    upper: "#070a18",
    lower: "#12162c",
    horizon: "#1f2340",
    light: "#b4a8ff",
    grade: "saturate(0.88) contrast(1.18)",
  },
};

const FALLBACK = {
  zenith: "#061229",
  upper: "#0d2247",
  lower: "#1b3a63",
  horizon: "#3d6491",
  light: "#cfe2ff",
  grade: "none",
};

/**
 * Which phase of the day it is at the *location*, using its own sunrise and
 * sunset. Dawn and dusk get their own palettes within an hour of the sun
 * crossing the horizon.
 */
export function dayPhase(weather) {
  if (!weather?.current) return "day";
  const { isDay } = weather.current;
  const today = weather.days?.[0];
  if (!today?.sunrise || !today?.sunset || !weather.current.time) {
    return isDay ? "day" : "night";
  }

  const now = parseLocalIso(weather.current.time).getTime();
  const sunrise = parseLocalIso(today.sunrise).getTime();
  const sunset = parseLocalIso(today.sunset).getTime();
  const hour = 60 * 60 * 1000;

  if (Math.abs(now - sunrise) <= hour) return "dawn";
  if (Math.abs(now - sunset) <= hour) return "dusk";
  return isDay ? "day" : "night";
}

/** Resolve the palette for the current weather. */
export function skyPalette(weather) {
  if (!weather?.current) return FALLBACK;
  const scene = weatherScene(weather.current.code);
  const phase = dayPhase(weather);

  return (
    PALETTES[`${scene}-${phase}`] ??
    // dawn/dusk variants only exist for clear and cloudy; everything else
    // falls back to its day or night entry.
    PALETTES[`${scene}-${phase === "night" ? "night" : "day"}`] ??
    FALLBACK
  );
}

/** Inline custom properties for the sky, applied to :root. */
export function skyVariables(weather) {
  const palette = skyPalette(weather);
  return {
    "--sky-zenith": palette.zenith,
    "--sky-upper": palette.upper,
    "--sky-lower": palette.lower,
    "--sky-horizon": palette.horizon,
    "--sky-light": palette.light,
    "--sky-grade": palette.grade,
    // Kept for the pre-mount paint and any surface wanting a flat colour.
    "--sky-1": palette.zenith,
    "--sky-2": palette.lower,
    "--sky-3": palette.horizon,
  };
}

export { PALETTES, FALLBACK };
