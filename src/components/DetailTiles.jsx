import { useGlassPointer } from "../hooks/useGlassPointer.js";
import {
  aqiDescriptor,
  compassDirection,
  degrees,
  distanceFrom,
  formatTime,
  humidityDescriptor,
  parseLocalIso,
  pressureDescriptor,
  speedUnit,
  uvDescriptor,
} from "../lib/format.js";
import "../styles/tiles.css";

export default function DetailTiles({ weather, children }) {
  const { current, days, air, units, timezone } = weather;
  const today = days?.[0];

  return (
    <section className="tiles" aria-label="Conditions detail">
      <UvTile uv={current.uvIndex} max={today?.uvIndexMax} />
      <WindTile
        speed={current.windSpeed}
        gusts={current.windGusts}
        direction={current.windDirection}
        units={units}
      />
      <SunTile
        sunrise={today?.sunrise}
        sunset={today?.sunset}
        now={current.time}
        timezone={timezone}
      />
      <AirTile air={air} />
      <Tile
        title="Humidity"
        value={
          current.humidity == null ? "--" : `${Math.round(current.humidity)}%`
        }
        note={humidityDescriptor(current.humidity)}
        index={4}
      >
        <Meter value={current.humidity} max={100} level="low" />
      </Tile>
      <Tile
        title="Feels like"
        value={degrees(current.feelsLike)}
        note={feelsNote(current.temperature, current.feelsLike)}
        index={5}
      />
      <Tile
        title="Visibility"
        value={distanceFrom(current.visibility, units)}
        note={visibilityNote(current.visibility)}
        index={6}
      />
      <Tile
        title="Pressure"
        value={
          current.pressure == null ? "--" : `${Math.round(current.pressure)}`
        }
        note={`hPa · ${pressureDescriptor(current.pressure)}`}
        index={7}
      />
      <Tile
        title="Dew point"
        value={degrees(current.dewPoint)}
        note={dewNote(current.dewPoint, units)}
        index={8}
      />
      {children}
    </section>
  );
}

function Tile({ title, value, note, children, index = 0, wide = false }) {
  const ref = useGlassPointer();
  return (
    <article
      ref={ref}
      className={`tile glass glass--refract glass--interactive glass--tilt rise ${
        wide ? "tile--wide" : ""
      }`}
      style={{ "--i": index + 4 }}
    >
      <h3 className="eyebrow tile__title">{title}</h3>
      <p className="tile__value">{value}</p>
      {children}
      {note ? <p className="tile__note">{note}</p> : null}
    </article>
  );
}

function Meter({ value, max, level }) {
  const pct = value == null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="meter" aria-hidden="true">
      <div
        className={`meter__fill meter__fill--${level}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function UvTile({ uv, max }) {
  const { label, level } = uvDescriptor(uv);
  return (
    <Tile
      title="UV index"
      value={uv == null ? "--" : Math.round(uv)}
      note={
        max == null || uv == null || Math.round(max) <= Math.round(uv)
          ? label
          : `${label} · peaks at ${Math.round(max)}`
      }
      index={0}
    >
      <div className="meter meter--uv" aria-hidden="true">
        <div
          className="meter__thumb"
          style={{ left: `${Math.min(100, ((uv ?? 0) / 11) * 100)}%` }}
        />
      </div>
      <span className={`tile__chip tile__chip--${level}`}>{label}</span>
    </Tile>
  );
}

function WindTile({ speed, gusts, direction, units }) {
  return (
    <Tile
      title="Wind"
      value={speed == null ? "--" : `${Math.round(speed)}`}
      note={`${speedUnit(units)} · gusts ${
        gusts == null ? "--" : Math.round(gusts)
      }`}
      index={1}
    >
      <div className="compass" aria-hidden="true">
        <span className="compass__ring" />
        <span className="compass__n">N</span>
        <span
          className="compass__needle"
          style={{ transform: `rotate(${(direction ?? 0) + 180}deg)` }} // points downwind
        />
        <span className="compass__dir">{compassDirection(direction)}</span>
      </div>
    </Tile>
  );
}

function SunTile({ sunrise, sunset, now, timezone }) {
  const progress = sunProgress(sunrise, sunset, now);
  const angle = Math.PI * (1 - progress);
  const x = 50 + 40 * Math.cos(angle);
  const y = 50 - 40 * Math.sin(angle);

  return (
    <Tile
      title="Sun"
      value={formatTime(sunset, timezone)}
      note={`Sunset · rose ${formatTime(sunrise, timezone)}`}
      index={2}
      wide
    >
      <svg className="sunarc" viewBox="0 0 100 58" aria-hidden="true">
        <path
          d="M10 50a40 40 0 0 1 80 0"
          className="sunarc__track"
          fill="none"
        />
        <path
          d="M10 50a40 40 0 0 1 80 0"
          className="sunarc__progress"
          fill="none"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progress * 100}
        />
        <line x1="6" y1="50" x2="94" y2="50" className="sunarc__horizon" />
        {progress > 0 && progress < 1 && (
          <circle cx={x} cy={y} r="4.5" className="sunarc__marker" />
        )}
      </svg>
    </Tile>
  );
}

function AirTile({ air }) {
  const aqi = air?.europeanAqi ?? air?.usAqi ?? null;
  const { label, level } = aqiDescriptor(air?.europeanAqi ?? null);
  return (
    <Tile
      title="Air quality"
      value={aqi == null ? "--" : Math.round(aqi)}
      note={
        air?.pm25 == null
          ? "Index unavailable"
          : `PM2.5 ${air.pm25.toFixed(1)} µg/m³`
      }
      index={3}
    >
      <Meter value={aqi} max={100} level={level} />
      <span className={`tile__chip tile__chip--${level}`}>{label}</span>
    </Tile>
  );
}

export function sunProgress(sunrise, sunset, now) {
  if (!sunrise || !sunset || !now) return 0;
  const rise = parseLocalIso(sunrise).getTime();
  const set = parseLocalIso(sunset).getTime();
  const current = parseLocalIso(now).getTime();
  if (!Number.isFinite(rise) || !Number.isFinite(set) || set <= rise) return 0;
  return Math.min(1, Math.max(0, (current - rise) / (set - rise)));
}

function feelsNote(actual, feels) {
  if (actual == null || feels == null) return "";
  const delta = feels - actual;
  if (Math.abs(delta) < 1) return "Same as the actual temperature";
  return delta > 0 ? "Humidity makes it warmer" : "Wind makes it colder";
}

function dewNote(dewPoint, units) {
  if (dewPoint == null) return "";
  const celsius = units === "imperial" ? ((dewPoint - 32) * 5) / 9 : dewPoint;
  if (celsius < 5) return "Very dry air";
  if (celsius < 10) return "Comfortable";
  if (celsius < 16) return "Getting sticky";
  if (celsius < 21) return "Humid";
  return "Oppressive";
}

function visibilityNote(metres) {
  if (metres == null) return "";
  if (metres >= 20000) return "Crystal clear";
  if (metres >= 10000) return "Clear";
  if (metres >= 4000) return "Slight haze";
  if (metres >= 1000) return "Hazy";
  return "Very poor";
}
