const CITIES_KEY = "rw.savedCities.v2";
const UNITS_KEY = "rw.units.v2";
const LAST_KEY = "rw.lastWeather.v2";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadCities() {
  const cities = read(CITIES_KEY, []);
  return Array.isArray(cities) ? cities : [];
}

export function saveCities(cities) {
  return write(CITIES_KEY, cities);
}

export function loadUnits() {
  const units = read(UNITS_KEY, "metric");
  return units === "imperial" ? "imperial" : "metric";
}

export function saveUnits(units) {
  return write(UNITS_KEY, units);
}

export function loadLastWeather() {
  return read(LAST_KEY, null);
}

export function saveLastWeather(weather) {
  return write(LAST_KEY, weather);
}
