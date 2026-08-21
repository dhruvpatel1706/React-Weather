/**
 * WMO 4677 weather interpretation codes, as returned by Open-Meteo.
 * Each code maps to a human label, an icon key, a scene key (which drives the
 * animated background), and a recommendation shown on the hero card.
 */

export const SCENE = {
  CLEAR: "clear",
  CLOUDS: "clouds",
  FOG: "fog",
  RAIN: "rain",
  DRIZZLE: "drizzle",
  SNOW: "snow",
  THUNDER: "thunder",
};

const CODES = {
  0: {
    label: "Clear sky",
    icon: "clear",
    scene: SCENE.CLEAR,
    day: "Not a cloud in sight. Sunglasses weather.",
    night: "Crystal clear tonight. Good stargazing.",
  },
  1: {
    label: "Mainly clear",
    icon: "mostly-clear",
    scene: SCENE.CLEAR,
    day: "Mostly blue skies with the odd wisp of cloud.",
    night: "Mostly clear, a few clouds drifting through.",
  },
  2: {
    label: "Partly cloudy",
    icon: "partly-cloudy",
    scene: SCENE.CLOUDS,
    day: "Sun and cloud taking turns. Layers are your friend.",
    night: "Patchy cloud overhead.",
  },
  3: {
    label: "Overcast",
    icon: "cloudy",
    scene: SCENE.CLOUDS,
    day: "Grey lid on the sky all day. Flat light.",
    night: "Fully clouded over.",
  },
  45: {
    label: "Fog",
    icon: "fog",
    scene: SCENE.FOG,
    day: "Thick fog. Slow down and put the headlights on.",
    night: "Dense fog tonight. Visibility is poor.",
  },
  48: {
    label: "Rime fog",
    icon: "fog",
    scene: SCENE.FOG,
    day: "Freezing fog leaving rime on everything. Mind the ice.",
    night: "Freezing fog. Surfaces will be slick.",
  },
  51: {
    label: "Light drizzle",
    icon: "drizzle",
    scene: SCENE.DRIZZLE,
    day: "A fine drizzle. Barely worth the umbrella, but take one.",
    night: "Light drizzle drifting about.",
  },
  53: {
    label: "Drizzle",
    icon: "drizzle",
    scene: SCENE.DRIZZLE,
    day: "Persistent drizzle. The kind that soaks you slowly.",
    night: "Steady drizzle through the night.",
  },
  55: {
    label: "Heavy drizzle",
    icon: "drizzle",
    scene: SCENE.DRIZZLE,
    day: "Heavy drizzle bordering on proper rain. Waterproofs on.",
    night: "Heavy drizzle. You will get wet.",
  },
  56: {
    label: "Freezing drizzle",
    icon: "sleet",
    scene: SCENE.DRIZZLE,
    day: "Freezing drizzle — black ice risk. Tread carefully.",
    night: "Freezing drizzle. Watch your footing.",
  },
  57: {
    label: "Freezing drizzle",
    icon: "sleet",
    scene: SCENE.DRIZZLE,
    day: "Dense freezing drizzle. Roads will glaze over.",
    night: "Dense freezing drizzle. Ice forming.",
  },
  61: {
    label: "Light rain",
    icon: "rain",
    scene: SCENE.RAIN,
    day: "Light rain on and off. Grab a jacket.",
    night: "Light rain through the evening.",
  },
  63: {
    label: "Rain",
    icon: "rain",
    scene: SCENE.RAIN,
    day: "Proper rain today. Umbrella, no negotiating.",
    night: "Steady rain overnight.",
  },
  65: {
    label: "Heavy rain",
    icon: "rain",
    scene: SCENE.RAIN,
    day: "Torrential out there. Waterproof everything.",
    night: "Heavy rain hammering down tonight.",
  },
  66: {
    label: "Freezing rain",
    icon: "sleet",
    scene: SCENE.RAIN,
    day: "Freezing rain. Genuinely treacherous underfoot.",
    night: "Freezing rain. Stay in if you can.",
  },
  67: {
    label: "Freezing rain",
    icon: "sleet",
    scene: SCENE.RAIN,
    day: "Heavy freezing rain. Ice on every surface.",
    night: "Heavy freezing rain. Travel is risky.",
  },
  71: {
    label: "Light snow",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Light snow falling. It will probably stick.",
    night: "Light snow drifting down.",
  },
  73: {
    label: "Snow",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Steady snowfall. Boots and a proper coat.",
    night: "Snow falling steadily overnight.",
  },
  75: {
    label: "Heavy snow",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Heavy snow piling up fast. Travel will suffer.",
    night: "Heavy snow overnight. Expect disruption.",
  },
  77: {
    label: "Snow grains",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Snow grains peppering down. Crisp and cold.",
    night: "Snow grains falling. Bitterly cold.",
  },
  80: {
    label: "Light showers",
    icon: "showers",
    scene: SCENE.RAIN,
    day: "Scattered showers. Sun between the soakings.",
    night: "Scattered showers passing through.",
  },
  81: {
    label: "Showers",
    icon: "showers",
    scene: SCENE.RAIN,
    day: "Showers rolling through. Keep a brolly handy.",
    night: "Showers on and off tonight.",
  },
  82: {
    label: "Violent showers",
    icon: "showers",
    scene: SCENE.RAIN,
    day: "Violent downpours incoming. Find cover when they hit.",
    night: "Violent downpours overnight.",
  },
  85: {
    label: "Snow showers",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Snow showers blowing through. Wrap up.",
    night: "Snow showers overnight.",
  },
  86: {
    label: "Heavy snow showers",
    icon: "snow",
    scene: SCENE.SNOW,
    day: "Heavy snow showers. Whiteout conditions possible.",
    night: "Heavy snow showers overnight.",
  },
  95: {
    label: "Thunderstorm",
    icon: "thunder",
    scene: SCENE.THUNDER,
    day: "Thunderstorms building. Get indoors when it breaks.",
    night: "Thunderstorms rolling through tonight.",
  },
  96: {
    label: "Thunderstorm, hail",
    icon: "thunder",
    scene: SCENE.THUNDER,
    day: "Storms with hail. Park under cover if you can.",
    night: "Storms with hail overnight.",
  },
  99: {
    label: "Thunderstorm, heavy hail",
    icon: "thunder",
    scene: SCENE.THUNDER,
    day: "Severe storms with heavy hail. Stay inside.",
    night: "Severe storms with heavy hail tonight.",
  },
};

const UNKNOWN = {
  label: "Unknown",
  icon: "cloudy",
  scene: SCENE.CLOUDS,
  day: "Conditions unclear right now.",
  night: "Conditions unclear right now.",
};

export function describeWeather(code) {
  return CODES[code] ?? UNKNOWN;
}

export function weatherLabel(code) {
  return describeWeather(code).label;
}

export function weatherIcon(code) {
  return describeWeather(code).icon;
}

export function weatherScene(code) {
  return describeWeather(code).scene;
}

export function recommendation(code, isDay = true) {
  const entry = describeWeather(code);
  return isDay ? entry.day : entry.night;
}
