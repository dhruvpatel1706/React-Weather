import WeatherIcon from "./WeatherIcon.jsx";
import { degrees, formatHour } from "../lib/format.js";
import { weatherLabel } from "../lib/weatherCodes.js";
import "../styles/hourly.css";

export default function HourlyStrip({ weather }) {
  const { hours, timezone } = weather;
  if (!hours?.length) return null;

  const temps = hours.map((h) => h.temperature).filter((t) => t != null);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;

  return (
    <section
      className="hourly panel glass glass--refract rise"
      style={{ "--i": 1 }}
    >
      <h2 className="eyebrow">Next 24 hours</h2>
      <div className="hourly__scroll scroll-x">
        <ul className="hourly__list">
          {hours.map((hour, index) => {
            const height =
              hour.temperature == null
                ? 0
                : ((hour.temperature - min) / span) * 100;
            return (
              <li className="hourly__item" key={hour.time}>
                <span className="hourly__time">
                  {index === 0 ? "Now" : formatHour(hour.time, timezone)}
                </span>
                <WeatherIcon
                  code={hour.code}
                  isDay={hour.isDay}
                  size={30}
                  title={weatherLabel(hour.code)}
                />
                {hour.precipitationProbability > 15 ? (
                  <span className="hourly__pop">
                    {Math.round(hour.precipitationProbability)}%
                  </span>
                ) : (
                  <span className="hourly__pop hourly__pop--empty" />
                )}
                <span className="hourly__temp">
                  {degrees(hour.temperature)}
                </span>
                <span className="hourly__bar" aria-hidden="true">
                  <span
                    className="hourly__bar-fill"
                    style={{ height: `${Math.max(6, height)}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
