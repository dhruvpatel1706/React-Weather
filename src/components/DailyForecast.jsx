import { useMemo, useState } from "react";
import WeatherIcon from "./WeatherIcon.jsx";
import {
  compassDirection,
  degrees,
  formatDayName,
  formatHour,
  formatTime,
  speedUnit,
} from "../lib/format.js";
import { recommendation, weatherLabel } from "../lib/weatherCodes.js";
import "../styles/daily.css";

export default function DailyForecast({ weather }) {
  const [openDate, setOpenDate] = useState(null);
  const { days, timezone } = weather;

  const hoursByDate = useMemo(() => {
    const map = new Map();
    for (const hour of weather.trendHours ?? weather.hours ?? []) {
      const date = hour.time.slice(0, 10);
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(hour);
    }
    return map;
  }, [weather]);

  if (!days?.length) return null;

  const lows = days.map((d) => d.min).filter((v) => v != null);
  const highs = days.map((d) => d.max).filter((v) => v != null);
  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const span = weekMax - weekMin || 1;

  return (
    <section
      className="daily panel glass glass--refract rise"
      style={{ "--i": 2 }}
    >
      <h2 className="eyebrow">{days.length}-day forecast</h2>
      <ul className="daily__list">
        {days.map((day, index) => {
          const left = ((day.min - weekMin) / span) * 100;
          const width = ((day.max - day.min) / span) * 100;
          const open = openDate === day.date;
          const hours = hoursByDate.get(day.date) ?? [];

          return (
            <li
              className={`daily__item ${open ? "is-open" : ""}`}
              key={day.date}
            >
              <button
                type="button"
                className="daily__row"
                onClick={() => setOpenDate(open ? null : day.date)}
                aria-expanded={open}
                aria-label={`${formatDayName(day.date, timezone, index)}, ${weatherLabel(
                  day.code
                )}, high ${degrees(day.max)}, low ${degrees(day.min)}`}
              >
                <span className="daily__day">
                  {formatDayName(day.date, timezone, index)}
                </span>

                <span className="daily__icon">
                  <WeatherIcon code={day.code} isDay size={28} />
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

                <span className="daily__chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="m8 10 4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {open && (
                <div className="daily__detail">
                  <p className="daily__summary">
                    {weatherLabel(day.code)}. {recommendation(day.code, true)}
                  </p>

                  <dl className="daily__facts">
                    <div>
                      <dt>Sunrise</dt>
                      <dd>{formatTime(day.sunrise, timezone)}</dd>
                    </div>
                    <div>
                      <dt>Sunset</dt>
                      <dd>{formatTime(day.sunset, timezone)}</dd>
                    </div>
                    <div>
                      <dt>Max wind</dt>
                      <dd>
                        {day.windMax == null ? "--" : Math.round(day.windMax)}{" "}
                        {speedUnit(weather.units)}{" "}
                        {day.windDirection == null
                          ? ""
                          : compassDirection(day.windDirection)}
                      </dd>
                    </div>
                    <div>
                      <dt>UV peak</dt>
                      <dd>
                        {day.uvIndexMax == null
                          ? "--"
                          : Math.round(day.uvIndexMax)}
                      </dd>
                    </div>
                    <div>
                      <dt>Rainfall</dt>
                      <dd>
                        {day.precipitationSum == null
                          ? "--"
                          : `${day.precipitationSum.toFixed(1)} ${
                              weather.units === "imperial" ? "in" : "mm"
                            }`}
                      </dd>
                    </div>
                    <div>
                      <dt>Feels</dt>
                      <dd>
                        {degrees(day.feelsMin)} / {degrees(day.feelsMax)}
                      </dd>
                    </div>
                  </dl>

                  {hours.length > 0 ? (
                    <ul className="daily__hours scroll-x">
                      {hours.map((hour) => (
                        <li key={hour.time} className="daily__hour">
                          <span className="daily__hour-time">
                            {formatHour(hour.time, timezone)}
                          </span>
                          <WeatherIcon
                            code={hour.code}
                            isDay={hour.isDay}
                            size={24}
                          />
                          <span className="daily__hour-temp">
                            {degrees(hour.temperature)}
                          </span>
                          <span className="daily__hour-pop">
                            {hour.precipitationProbability > 15
                              ? `${Math.round(hour.precipitationProbability)}%`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="daily__no-hours">
                      Hourly detail is only available for the next two days.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
