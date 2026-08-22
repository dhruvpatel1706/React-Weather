import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import GlassFilters from "./components/GlassFilters.jsx";
import SkyBackground from "./components/SkyBackground.jsx";
import TopBar from "./components/TopBar.jsx";
import Hero from "./components/Hero.jsx";
import Nowcast from "./components/Nowcast.jsx";
import HourlyStrip from "./components/HourlyStrip.jsx";
import TrendChart from "./components/TrendChart.jsx";
import DailyForecast from "./components/DailyForecast.jsx";
import DayDial from "./components/DayDial.jsx";
import DetailTiles from "./components/DetailTiles.jsx";
import AstroTiles from "./components/AstroTiles.jsx";
import PollenTile from "./components/PollenTile.jsx";
import SavedCities from "./components/SavedCities.jsx";
import StatusScreen from "./components/StatusScreen.jsx";

import { useWeather } from "./hooks/useWeather.js";
import { useSavedCities } from "./hooks/useSavedCities.js";
import { useGeolocation } from "./hooks/useGeolocation.js";
import { useScrollProgress } from "./hooks/useScrollProgress.js";
import { skyVariables } from "./lib/sky.js";
import { loadUnits, saveUnits, loadLastWeather } from "./lib/storage.js";
import { placeFromUrl, syncUrl } from "./lib/url.js";
import "./styles/global.css";

const DEFAULT_PLACE = {
  id: "0.515,35.270",
  name: "Eldoret",
  country: "Kenya",
  countryCode: "KE",
  admin: "Uasin Gishu",
  latitude: 0.5152,
  longitude: 35.2698,
};

const REFRESH_MS = 10 * 60 * 1000;

function initialPlace() {
  return placeFromUrl() ?? loadLastWeather()?.place ?? DEFAULT_PLACE;
}

function initialTheme() {
  if (typeof document === "undefined") return "dark";
  const declared = document.documentElement.dataset.theme;
  if (declared === "light" || declared === "dark") return declared;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function App() {
  const [place, setPlace] = useState(initialPlace);
  const [units, setUnits] = useState(loadUnits);
  const [theme, setTheme] = useState(initialTheme);

  const { weather, status, error, stale, refresh } = useWeather(place, units);
  const { cities, isSaved, toggle, remove } = useSavedCities();
  const { locate, locating, error: locationError } = useGeolocation();

  useScrollProgress();
  const searchRef = useRef(null);

  useEffect(() => {
    saveUnits(units);
  }, [units]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    syncUrl(place);
  }, [place]);

  useEffect(() => {
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - (weather?.fetchedAt ?? 0) > REFRESH_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, weather?.fetchedAt]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      } else if (event.key.toLowerCase() === "r") {
        refresh();
      } else if (event.key.toLowerCase() === "u") {
        setUnits((current) => (current === "metric" ? "imperial" : "metric"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [refresh]);

  const useMyLocation = useCallback(() => {
    locate()
      .then(setPlace)
      .catch(() => {});
  }, [locate]);

  const styleVars = useMemo(() => skyVariables(weather), [weather]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(styleVars)) {
      root.style.setProperty(name, value);
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", styleVars["--sky-1"]);
  }, [styleVars]);

  const saved = isSaved(place);

  return (
    <div className="app">
      <GlassFilters />
      <SkyBackground weather={weather} />

      <TopBar
        ref={searchRef}
        onSelect={setPlace}
        onLocate={useMyLocation}
        locating={locating}
        units={units}
        onUnitsChange={setUnits}
        place={weather?.place ?? place}
        theme={theme}
        onThemeChange={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        weather={weather}
      />

      <main className="app__content">
        {locationError && (
          <p className="app__notice glass glass--thin" role="alert">
            {locationError}
          </p>
        )}

        {status === "loading" && !weather && <StatusScreen variant="loading" />}
        {status === "error" && !weather && (
          <StatusScreen variant="error" message={error} onRetry={refresh} />
        )}

        {weather && (
          <>
            <Hero
              weather={weather}
              saved={saved}
              onToggleSave={() => toggle(weather.place ?? place)}
              onRefresh={refresh}
              refreshing={status === "refreshing"}
              stale={stale}
            />

            {/* The sheet slides up over the hero as you scroll. */}
            <div className="sheet">
              <SavedCities
                cities={cities}
                activeId={place.id}
                onSelect={setPlace}
                onRemove={remove}
              />

              <Nowcast weather={weather} />
              <HourlyStrip weather={weather} />

              <div className="sheet__split">
                <DailyForecast weather={weather} />
                <div className="stack">
                  <DayDial weather={weather} />
                  <TrendChart weather={weather} />
                </div>
              </div>

              <DetailTiles weather={weather}>
                <AstroTiles weather={weather} />
                <PollenTile weather={weather} />
              </DetailTiles>
            </div>
          </>
        )}

        <footer className="app__footer">
          <p>
            Weather by{" "}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open-Meteo
            </a>
            {" · "}
            <span className="app__hint">
              <kbd>/</kbd> search · <kbd>R</kbd> refresh · <kbd>U</kbd> units
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}
