import WeatherIcon from "./WeatherIcon.jsx";
import RollingNumber from "./RollingNumber.jsx";
import { recommendation, weatherLabel } from "../lib/weatherCodes.js";
import {
  degrees,
  formatFullDate,
  formatTime,
  placeLabel,
  tempUnit,
} from "../lib/format.js";
import "../styles/hero.css";

/**
 * Full-bleed hero. Deliberately has no glass panel behind it: the type sits
 * directly on the sky, which is what makes the composition feel like weather
 * rather than like a dashboard. Legibility comes from a text shadow and the
 * vignette above, not from a card.
 */
export default function Hero({
  weather,
  saved,
  onToggleSave,
  onRefresh,
  refreshing,
  stale,
}) {
  const { current, place, timezone, units, days, yesterday } = weather;
  const today = days?.[0];
  const comparison = compareToYesterday(today, yesterday);

  return (
    <section className="hero">
      <div className="hero__top">
        <div className="hero__place">
          <h1 className="hero__city">{place.name}</h1>
          <p className="hero__region">
            {[place.admin, place.country].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="hero__actions">
          <button
            type="button"
            className={`icon-btn glass glass--thin glass--interactive ${saved ? "is-on" : ""}`}
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved cities" : "Save this city"}
          >
            <StarGlyph filled={saved} />
          </button>
          <button
            type="button"
            className="icon-btn glass glass--thin glass--interactive"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh weather"
          >
            <RefreshGlyph spinning={refreshing} />
          </button>
        </div>
      </div>

      <div className="hero__lower">
      <div className="hero__reading">
        <div className="hero__temp-wrap">
          <p className="hero__temp">
            <RollingNumber value={Math.round(current.temperature ?? 0)} />
            <span className="hero__deg">°</span>
            <span className="hero__unit">{tempUnit(units).replace("°", "")}</span>
          </p>
          <WeatherIcon
            code={current.code}
            isDay={current.isDay}
            size={116}
            className="hero__icon"
            title={weatherLabel(current.code)}
          />
        </div>

        <p className="hero__condition">{weatherLabel(current.code)}</p>

        <p className="hero__meta">
          <span className="hero__hi">H {degrees(today?.max)}</span>
          <span className="hero__dot" />
          <span className="hero__lo">L {degrees(today?.min)}</span>
          <span className="hero__dot" />
          <span>Feels {degrees(current.feelsLike)}</span>
        </p>

        <p className="hero__date">
          {formatFullDate(current.time, timezone)} · {formatTime(current.time, timezone)}
        </p>
      </div>

      <p className="hero__recommendation">
        {recommendation(current.code, current.isDay)}
        {comparison ? <span className="hero__compare"> {comparison}</span> : null}
      </p>

      {stale && (
        <p className="hero__stale" role="status">
          Offline — showing your last saved reading
        </p>
      )}
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

/** "3° warmer than yesterday" — compares today's high with yesterday's. */
export function compareToYesterday(today, yesterday) {
  if (today?.max == null || yesterday?.max == null) return "";
  const delta = Math.round(today.max - yesterday.max);
  if (delta === 0) return "About the same as yesterday.";
  return `${Math.abs(delta)}° ${delta > 0 ? "warmer" : "cooler"} than yesterday.`;
}

const StarGlyph = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshGlyph = ({ spinning }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={spinning ? "is-spinning" : ""}>
    <path
      d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
