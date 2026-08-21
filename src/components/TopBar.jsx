import { forwardRef, useEffect, useState } from "react";
import SearchBar from "./SearchBar.jsx";
import Toolbar from "./Toolbar.jsx";
import WeatherIcon from "./WeatherIcon.jsx";
import { degrees } from "../lib/format.js";
import "../styles/topbar.css";

const TopBar = forwardRef(function TopBar(
  {
    onSelect,
    onLocate,
    locating,
    units,
    onUnitsChange,
    place,
    theme,
    onThemeChange,
    weather,
  },
  searchRef
) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCondensed(window.scrollY > window.innerHeight * 0.42);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`topbar ${condensed ? "is-condensed" : ""}`}>
      <div className="topbar__inner glass glass--thin">
        <div className="topbar__identity" aria-hidden={!condensed}>
          {weather && (
            <>
              <WeatherIcon
                code={weather.current.code}
                isDay={weather.current.isDay}
                size={26}
              />
              <span className="topbar__city">{weather.place.name}</span>
              <span className="topbar__temp">
                {degrees(weather.current.temperature)}
              </span>
            </>
          )}
        </div>

        <div className="topbar__search" ref={searchRef}>
          <SearchBar
            onSelect={onSelect}
            onLocate={onLocate}
            locating={locating}
          />
        </div>

        <Toolbar
          units={units}
          onUnitsChange={onUnitsChange}
          place={place}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </header>
  );
});

export default TopBar;
