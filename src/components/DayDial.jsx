import { useId } from "react";
import { degrees, formatHour, parseLocalIso } from "../lib/format.js";
import { weatherLabel } from "../lib/weatherCodes.js";
import WeatherIcon from "./WeatherIcon.jsx";
import "../styles/dial.css";

export default function DayDial({ weather }) {
  const uid = useId().replace(/:/g, "");
  const hours = (weather.trendHours ?? weather.hours ?? []).slice(0, 24);
  if (hours.length < 8) return null;

  const today = weather.days?.[0];
  const rTempMin = 54;
  const rTempMax = 92;
  const rPrecipBase = 96;
  const rPrecipMax = 112;
  const rDaylight = 120;
  const rTickInner = 126;
  const rTickOuter = 132;
  const rLabel = 146;
  const size = (rLabel + 10) * 2;
  const c = size / 2;

  const temps = hours.map((h) => h.temperature).filter((t) => t != null);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;

  const angleFor = (iso) => {
    const date = parseLocalIso(iso);
    const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
    return (minutes / 1440) * 360 - 90;
  };

  const point = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return [c + Math.cos(rad) * radius, c + Math.sin(rad) * radius];
  };

  const ringPoints = hours.map((hour) => {
    const t = hour.temperature == null ? min : hour.temperature;
    const radius = rTempMin + ((t - min) / span) * (rTempMax - rTempMin);
    return point(angleFor(hour.time), radius);
  });

  const ringPath = closedSpline(ringPoints);

  const daylight =
    today?.sunrise && today?.sunset
      ? describeArc(
          c,
          rDaylight,
          angleFor(today.sunrise),
          angleFor(today.sunset)
        )
      : null;

  const nowAngle = weather.current?.time
    ? angleFor(weather.current.time)
    : null;
  const nowPoint = nowAngle == null ? null : point(nowAngle, rDaylight);

  return (
    <section
      className="dial panel glass glass--refract rise"
      style={{ "--i": 3 }}
    >
      <div className="dial__head">
        <h2 className="eyebrow">The day at a glance</h2>
        <p className="dial__caption">
          Midnight at the top, clockwise through the day
        </p>
      </div>

      <div className="dial__body">
        <svg
          className="dial__svg"
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`24-hour dial. Temperatures range from ${degrees(min)} to ${degrees(max)}.`}
        >
          <defs>
            <linearGradient
              id={`${uid}-ring`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--accent-cool)" />
              <stop offset="50%" stopColor="var(--accent-moderate)" />
              <stop offset="100%" stopColor="var(--accent-warm)" />
            </linearGradient>
          </defs>

          {/* Hour ticks, emphasised every six hours. */}
          {Array.from({ length: 24 }, (_, hour) => {
            const angle = (hour / 24) * 360 - 90;
            const major = hour % 6 === 0;
            const [x1, y1] = point(angle, rTickInner);
            const [x2, y2] = point(angle, major ? rTickOuter : rTickOuter - 3);
            return (
              <line
                key={hour}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={
                  major ? "dial__tick dial__tick--major" : "dial__tick"
                }
              />
            );
          })}

          {/* Daylight arc. */}
          {daylight && (
            <path d={daylight} className="dial__daylight" fill="none" />
          )}

          <circle
            cx={c}
            cy={c}
            r={rTempMin}
            className="dial__base"
            fill="none"
          />
          <circle
            cx={c}
            cy={c}
            r={rTempMax}
            className="dial__base"
            fill="none"
          />

          {/* Precipitation spokes. */}
          {hours.map((hour) => {
            const probability = hour.precipitationProbability ?? 0;
            if (probability < 25) return null;
            const angle = angleFor(hour.time);
            const [x1, y1] = point(angle, rPrecipBase);
            const [x2, y2] = point(
              angle,
              rPrecipBase + (probability / 100) * (rPrecipMax - rPrecipBase)
            );
            return (
              <line
                key={`p-${hour.time}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="dial__precip"
                strokeOpacity={0.25 + (probability / 100) * 0.6}
              />
            );
          })}

          <path
            d={ringPath}
            className="dial__ring"
            stroke={`url(#${uid}-ring)`}
            fill="none"
          />

          {/* Now marker. */}
          {nowPoint && (
            <>
              <circle
                cx={nowPoint[0]}
                cy={nowPoint[1]}
                r="5.5"
                className="dial__now"
              />
              <circle
                cx={nowPoint[0]}
                cy={nowPoint[1]}
                r="10"
                className="dial__now-halo"
              />
            </>
          )}

          {/* Centre readout. */}
          <text
            x={c}
            y={c - 10}
            className="dial__centre-top"
            textAnchor="middle"
          >
            {degrees(max)}
          </text>
          <text
            x={c}
            y={c + 9}
            className="dial__centre-label"
            textAnchor="middle"
          >
            HIGH · LOW
          </text>
          <text
            x={c}
            y={c + 33}
            className="dial__centre-bottom"
            textAnchor="middle"
          >
            {degrees(min)}
          </text>

          {[0, 6, 12, 18].map((hour) => {
            const angle = (hour / 24) * 360 - 90;
            const [x, y] = point(angle, rLabel);
            return (
              <text
                key={hour}
                x={x}
                y={y + 4}
                className="dial__hour"
                textAnchor="middle"
              >
                {hour === 0
                  ? "12a"
                  : hour === 12
                    ? "12p"
                    : hour > 12
                      ? `${hour - 12}p`
                      : `${hour}a`}
              </text>
            );
          })}
        </svg>

        <ul className="dial__legend">
          {pickMoments(hours).map((moment) => (
            <li key={moment.label} className="dial__moment">
              <span className="dial__moment-time">{moment.label}</span>
              <WeatherIcon
                code={moment.hour.code}
                isDay={moment.hour.isDay}
                size={26}
                title={weatherLabel(moment.hour.code)}
              />
              <span className="dial__moment-temp">
                {degrees(moment.hour.temperature)}
              </span>
              <span className="dial__moment-time dial__moment-clock">
                {formatHour(moment.hour.time, weather.timezone)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function pickMoments(hours) {
  const warmest = hours.reduce((a, b) =>
    (b.temperature ?? -Infinity) > (a.temperature ?? -Infinity) ? b : a
  );
  const coldest = hours.reduce((a, b) =>
    (b.temperature ?? Infinity) < (a.temperature ?? Infinity) ? b : a
  );
  const wettest = hours.reduce((a, b) =>
    (b.precipitationProbability ?? 0) > (a.precipitationProbability ?? 0)
      ? b
      : a
  );

  const moments = [
    { label: "Now", hour: hours[0] },
    { label: "Warmest", hour: warmest },
    { label: "Coolest", hour: coldest },
  ];
  const alreadyShown = moments.some((m) => m.hour.time === wettest.time);
  if ((wettest.precipitationProbability ?? 0) >= 30 && !alreadyShown) {
    moments.push({ label: "Wettest", hour: wettest });
  }
  return moments;
}

function closedSpline(points) {
  if (points.length < 3) return "";
  const path = [`M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`];
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    path.push(
      `Q ${current[0].toFixed(2)} ${current[1].toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`
    );
  }
  path.push("Z");
  return path.join(" ");
}

function describeArc(centre, radius, startAngle, endAngle) {
  const toXY = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return [centre + Math.cos(rad) * radius, centre + Math.sin(rad) * radius];
  };
  const [x1, y1] = toXY(startAngle);
  const [x2, y2] = toXY(endAngle);
  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export { pickMoments, describeArc, closedSpline };
