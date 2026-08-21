const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "dew_point_2m",
];

const HOURLY_FIELDS = [
  "temperature_2m",
  "weather_code",
  "precipitation_probability",
  "is_day",
  "uv_index",
  "visibility",
  "dew_point_2m",
  "precipitation",
];

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "uv_index_max",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "precipitation_sum",
  "daylight_duration",
  "wind_direction_10m_dominant",
  "apparent_temperature_max",
  "apparent_temperature_min",
];

const MINUTELY_FIELDS = ["precipitation", "weather_code"];

const POLLEN_FIELDS = [
  "alder_pollen",
  "birch_pollen",
  "grass_pollen",
  "mugwort_pollen",
  "olive_pollen",
  "ragweed_pollen",
];

function qs(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return search.toString();
}

async function getJSON(url, { signal } = {}) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Network unavailable. Check your connection.");
  }
  if (!response.ok) {
    throw new Error(`Weather service error (${response.status}).`);
  }
  return response.json();
}

export async function searchCities(name, { signal, count = 6 } = {}) {
  const query = name.trim();
  if (query.length < 2) return [];
  const url = `${GEOCODE_URL}?${qs({
    name: query,
    count,
    language: "en",
    format: "json",
  })}`;
  const data = await getJSON(url, { signal });
  return (data.results ?? []).map(toPlace);
}

function toPlace(result) {
  return {
    id: `${result.latitude.toFixed(3)},${result.longitude.toFixed(3)}`,
    name: result.name,
    country: result.country ?? "",
    countryCode: result.country_code ?? "",
    admin: result.admin1 ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

export async function reverseGeocode(latitude, longitude, { signal } = {}) {
  const fallback = {
    id: `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    name: "My Location",
    country: "",
    countryCode: "",
    admin: "",
    latitude,
    longitude,
  };
  try {
    const url = `${REVERSE_URL}?${qs({
      latitude,
      longitude,
      localityLanguage: "en",
    })}`;
    const data = await getJSON(url, { signal });
    return {
      ...fallback,
      name:
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        "My Location",
      country: data.countryName ?? "",
      countryCode: data.countryCode ?? "",
      admin: data.principalSubdivision ?? "",
    };
  } catch {
    return fallback;
  }
}

async function fetchAirQuality(latitude, longitude, { signal } = {}) {
  try {
    const url = `${AIR_URL}?${qs({
      latitude,
      longitude,
      current: ["european_aqi", "us_aqi", "pm2_5", "pm10", ...POLLEN_FIELDS],
      timezone: "auto",
    })}`;
    const data = await getJSON(url, { signal });
    const current = data.current ?? {};
    if (current.european_aqi == null && current.us_aqi == null) return null;

    const pollen = POLLEN_FIELDS.map((field) => ({
      key: field.replace("_pollen", ""),
      value: current[field] ?? null,
    })).filter((entry) => entry.value != null);

    return {
      europeanAqi: current.european_aqi ?? null,
      usAqi: current.us_aqi ?? null,
      pm25: current.pm2_5 ?? null,
      pm10: current.pm10 ?? null,
      pollen,
    };
  } catch {
    return null;
  }
}

export async function fetchWeather(place, { signal, units = "metric" } = {}) {
  const imperial = units === "imperial";
  const url = `${FORECAST_URL}?${qs({
    latitude: place.latitude,
    longitude: place.longitude,
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    minutely_15: MINUTELY_FIELDS,
    timezone: "auto",
    forecast_days: 10,
    past_days: 1,
    forecast_minutely_15: 48,
    temperature_unit: imperial ? "fahrenheit" : "celsius",
    wind_speed_unit: imperial ? "mph" : "kmh",
    precipitation_unit: imperial ? "inch" : "mm",
  })}`;

  const [forecast, air] = await Promise.all([
    getJSON(url, { signal }),
    fetchAirQuality(place.latitude, place.longitude, { signal }),
  ]);

  return normalise(forecast, air, place, units);
}

function normalise(data, air, place, units) {
  const current = data.current ?? {};
  const hourly = data.hourly ?? {};
  const daily = data.daily ?? {};
  const minutely = data.minutely_15 ?? {};

  const nowIso = current.time;
  const hourIndex = Math.max(0, (hourly.time ?? []).indexOf(nowIso));

  const allHours = (hourly.time ?? []).map((time, index) => ({
    time,
    temperature: hourly.temperature_2m?.[index] ?? null,
    code: hourly.weather_code?.[index] ?? 0,
    precipitationProbability: hourly.precipitation_probability?.[index] ?? 0,
    precipitation: hourly.precipitation?.[index] ?? 0,
    isDay: hourly.is_day?.[index] === 1,
    uvIndex: hourly.uv_index?.[index] ?? null,
    visibility: hourly.visibility?.[index] ?? null,
    dewPoint: hourly.dew_point_2m?.[index] ?? null,
  }));

  const hours = allHours.slice(hourIndex, hourIndex + 24);
  const trendHours = allHours.slice(hourIndex, hourIndex + 48);

  const allDays = (daily.time ?? []).map((date, index) => ({
    date,
    code: daily.weather_code?.[index] ?? 0,
    max: daily.temperature_2m_max?.[index] ?? null,
    min: daily.temperature_2m_min?.[index] ?? null,
    feelsMax: daily.apparent_temperature_max?.[index] ?? null,
    feelsMin: daily.apparent_temperature_min?.[index] ?? null,
    sunrise: daily.sunrise?.[index] ?? null,
    sunset: daily.sunset?.[index] ?? null,
    uvIndexMax: daily.uv_index_max?.[index] ?? null,
    precipitationProbability: daily.precipitation_probability_max?.[index] ?? 0,
    precipitationSum: daily.precipitation_sum?.[index] ?? 0,
    daylightSeconds: daily.daylight_duration?.[index] ?? null,
    windMax: daily.wind_speed_10m_max?.[index] ?? null,
    windDirection: daily.wind_direction_10m_dominant?.[index] ?? null,
  }));

  // past_days=1 puts yesterday at index 0, so locate today explicitly.
  const todayIso = nowIso ? nowIso.slice(0, 10) : null;
  let todayIndex = allDays.findIndex((day) => day.date === todayIso);
  if (todayIndex < 0) todayIndex = allDays.length > 1 ? 1 : 0;

  const yesterday = todayIndex > 0 ? allDays[todayIndex - 1] : null;
  const days = allDays.slice(todayIndex);

  return {
    place,
    units,
    fetchedAt: Date.now(),
    timezone: data.timezone ?? place.timezone ?? "UTC",
    current: {
      time: nowIso,
      temperature: current.temperature_2m ?? null,
      feelsLike: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      code: current.weather_code ?? 0,
      isDay: current.is_day === 1,
      precipitation: current.precipitation ?? 0,
      cloudCover: current.cloud_cover ?? null,
      pressure: current.pressure_msl ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windDirection: current.wind_direction_10m ?? null,
      windGusts: current.wind_gusts_10m ?? null,
      dewPoint: current.dew_point_2m ?? null,
      uvIndex: hours[0]?.uvIndex ?? days[0]?.uvIndexMax ?? null,
      visibility: hours[0]?.visibility ?? null,
    },
    hours,
    trendHours,
    days,
    yesterday,
    minutely: normaliseMinutely(minutely, nowIso),
    air,
  };
}

function normaliseMinutely(minutely, nowIso) {
  const times = minutely.time ?? [];
  if (!times.length) return [];

  const now = nowIso ? nowIso.slice(0, 13) : null;
  let start = now ? times.findIndex((t) => t.slice(0, 13) === now) : 0;
  if (start < 0) start = 0;

  return times.slice(start, start + 48).map((time, index) => ({
    time,
    precipitation: minutely.precipitation?.[start + index] ?? 0,
    code: minutely.weather_code?.[start + index] ?? 0,
  }));
}
