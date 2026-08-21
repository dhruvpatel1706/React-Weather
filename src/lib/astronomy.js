const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // reference new moon

const PHASES = [
  { name: "New Moon", icon: "new" },
  { name: "Waxing Crescent", icon: "waxing-crescent" },
  { name: "First Quarter", icon: "first-quarter" },
  { name: "Waxing Gibbous", icon: "waxing-gibbous" },
  { name: "Full Moon", icon: "full" },
  { name: "Waning Gibbous", icon: "waning-gibbous" },
  { name: "Last Quarter", icon: "last-quarter" },
  { name: "Waning Crescent", icon: "waning-crescent" },
];

export function moonPhase(date = new Date()) {
  const days = date.getTime() / 86400000;
  let phase = ((days - KNOWN_NEW_MOON) / SYNODIC_MONTH) % 1;
  if (phase < 0) phase += 1;

  const index = Math.round(phase * 8) % 8;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;

  return {
    phase,
    name: PHASES[index].name,
    icon: PHASES[index].icon,
    illumination,
  };
}

export function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return "--";
  const total = Math.round(seconds / 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
}

export function daylightDelta(todaySeconds, yesterdaySeconds) {
  if (todaySeconds == null || yesterdaySeconds == null) return null;
  return Math.round((todaySeconds - yesterdaySeconds) / 60);
}
