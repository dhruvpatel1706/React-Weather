import WeatherIcon from "./WeatherIcon.jsx";
import { degrees, formatDayName } from "../lib/format.js";
import { weatherLabel } from "../lib/weatherCodes.js";
import "../styles/daily.css";

/**
 * Multi-day outlook. Each row's temperature range is drawn as a bar positioned
 * within the whole period's span, so you can read the trend at a glance.
 */
export default function DailyForecast({ weather }) {
  const { days, timezone } = weather;
  if (!days?.length) return null;

  const lows = days.map((d) => d.min).filter((v) => v != null);
  const highs = days.map((d) => d.max).filter((v) => v != null);
  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const span = weekMax - weekMin || 1;

  return (
    <section className="daily panel glass glass--refract rise" style={{ "--i": 2 }}>
      <h2 className="eyebrow">{days.length}-day forecast</h2>
      <ul className="daily__list">
        {days.map((day, index) => {
          const left = ((day.min - weekMin) / span) * 100;
          const width = ((day.max - day.min) / span) * 100;
          return (
            <li className="daily__row" key={day.date}>
              <span className="daily__day">
                {formatDayName(day.date, timezone, index)}
              </span>

              <span className="daily__icon">
                <WeatherIcon
                  code={day.code}
                  isDay
                  size={28}
                  title={weatherLabel(day.code)}
                />
              </span>

              <span className="daily__pop">
                {day.precipitationProbability > 15
                  ? `${Math.round(day.precipitationProbability)}%`
                  : ""}
              </span>

              <span className="daily__lo">{degrees(day.min)}</span>

              <span className="daily__track" aria-hidden="true">
                <span
                  className="daily__range"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(8, width)}%`,
                  }}
                />
              </span>

              <span className="daily__hi">{degrees(day.max)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
