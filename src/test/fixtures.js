export const PLACE = {
  id: "51.508,-0.126",
  name: "London",
  country: "United Kingdom",
  countryCode: "GB",
  admin: "England",
  latitude: 51.5085,
  longitude: -0.1257,
  timezone: "Europe/London",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function isoHour(dayOffset, hour) {
  const date = new Date(Date.UTC(2026, 7, 21 + dayOffset));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}T${pad(hour)}:00`;
}

function isoDay(dayOffset) {
  const date = new Date(Date.UTC(2026, 7, 21 + dayOffset));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

export function forecastResponse({ code = 61, isDay = 1, hour = 14 } = {}) {
  const hourlyTime = [];
  const temperature = [];
  const weatherCode = [];
  const pop = [];
  const precipitation = [];
  const isDayArr = [];
  const uv = [];
  const visibility = [];
  const dewPoint = [];

  for (let day = -1; day <= 9; day += 1) {
    for (let h = 0; h < 24; h += 1) {
      hourlyTime.push(isoHour(day, h));
      const curve = Math.sin(((h - 6) / 24) * Math.PI * 2);
      temperature.push(Number((16 + curve * 6 + day * 0.4).toFixed(1)));
      weatherCode.push(h % 7 === 0 ? 3 : h % 5 === 0 ? 61 : 2);
      pop.push(Math.max(0, Math.round(40 + curve * 35)));
      precipitation.push(h % 5 === 0 ? 0.4 : 0);
      isDayArr.push(h >= 6 && h < 20 ? 1 : 0);
      uv.push(Number(Math.max(0, curve * 6 + 2).toFixed(1)));
      visibility.push(24000 - (h % 6) * 2000);
      dewPoint.push(Number((11 + curve * 2).toFixed(1)));
    }
  }

  const dailyTime = [];
  const dailyCode = [];
  const tmax = [];
  const tmin = [];
  const sunrise = [];
  const sunset = [];
  const uvMax = [];
  const popMax = [];
  const windMax = [];
  const precipSum = [];
  const daylight = [];
  const windDir = [];
  const appMax = [];
  const appMin = [];

  for (let day = -1; day <= 9; day += 1) {
    dailyTime.push(isoDay(day));
    dailyCode.push([61, 3, 2, 0, 80, 63, 2, 1, 45, 95, 71][day + 1] ?? 2);
    tmax.push(Number((21 + Math.sin(day) * 3).toFixed(1)));
    tmin.push(Number((12 + Math.cos(day) * 2).toFixed(1)));
    appMax.push(Number((22 + Math.sin(day) * 3).toFixed(1)));
    appMin.push(Number((11 + Math.cos(day) * 2).toFixed(1)));
    sunrise.push(`${isoDay(day)}T06:${pad(10 + day)}`);
    sunset.push(`${isoDay(day)}T19:${pad(50 - day)}`);
    uvMax.push(Number((5 + (day % 3)).toFixed(1)));
    popMax.push(30 + ((day * 13) % 60));
    windMax.push(14 + ((day * 5) % 18));
    precipSum.push(Number((Math.abs(Math.sin(day)) * 4).toFixed(1)));
    daylight.push(49200 - day * 120);
    windDir.push((200 + day * 20) % 360);
  }

  const minutelyTime = [];
  const minutelyPrecip = [];
  const minutelyCode = [];
  for (let i = 0; i < 96; i += 1) {
    const totalMinutes = hour * 60 + i * 15;
    const day = Math.floor(totalMinutes / (24 * 60));
    const minuteOfDay = totalMinutes % (24 * 60);
    minutelyTime.push(
      `${isoDay(day)}T${pad(Math.floor(minuteOfDay / 60))}:${pad(minuteOfDay % 60)}`
    );
    minutelyPrecip.push(
      i < 3 ? 0 : i < 12 ? Number((0.3 + (i % 4) * 0.35).toFixed(2)) : 0
    );
    minutelyCode.push(i >= 3 && i < 12 ? 61 : 2);
  }

  return {
    latitude: PLACE.latitude,
    longitude: PLACE.longitude,
    timezone: "Europe/London",
    timezone_abbreviation: "BST",
    current: {
      time: isoHour(0, hour),
      interval: 900,
      temperature_2m: 18.4,
      relative_humidity_2m: 72,
      apparent_temperature: 17.6,
      is_day: isDay,
      precipitation: 0.2,
      weather_code: code,
      cloud_cover: 84,
      pressure_msl: 1009.4,
      wind_speed_10m: 17.3,
      wind_direction_10m: 232,
      wind_gusts_10m: 31.7,
      dew_point_2m: 13.2,
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: temperature,
      weather_code: weatherCode,
      precipitation_probability: pop,
      precipitation,
      is_day: isDayArr,
      uv_index: uv,
      visibility,
      dew_point_2m: dewPoint,
    },
    daily: {
      time: dailyTime,
      weather_code: dailyCode,
      temperature_2m_max: tmax,
      temperature_2m_min: tmin,
      apparent_temperature_max: appMax,
      apparent_temperature_min: appMin,
      sunrise,
      sunset,
      uv_index_max: uvMax,
      precipitation_probability_max: popMax,
      wind_speed_10m_max: windMax,
      precipitation_sum: precipSum,
      daylight_duration: daylight,
      wind_direction_10m_dominant: windDir,
    },
    minutely_15: {
      time: minutelyTime,
      precipitation: minutelyPrecip,
      weather_code: minutelyCode,
    },
  };
}

export function airQualityResponse() {
  return {
    latitude: PLACE.latitude,
    longitude: PLACE.longitude,
    timezone: "Europe/London",
    current: {
      time: isoHour(0, 14),
      european_aqi: 34,
      us_aqi: 41,
      pm2_5: 8.4,
      pm10: 14.2,
      alder_pollen: 0,
      birch_pollen: 12,
      grass_pollen: 68,
      mugwort_pollen: 3,
      olive_pollen: 0,
      ragweed_pollen: 21,
    },
  };
}

export function geocodeResponse() {
  return {
    results: [
      {
        id: 2643743,
        name: "London",
        latitude: 51.50853,
        longitude: -0.12574,
        country: "United Kingdom",
        country_code: "GB",
        admin1: "England",
        timezone: "Europe/London",
      },
      {
        id: 6058560,
        name: "London",
        latitude: 42.98339,
        longitude: -81.23304,
        country: "Canada",
        country_code: "CA",
        admin1: "Ontario",
        timezone: "America/Toronto",
      },
    ],
  };
}
