import { useId } from "react";
import { degrees, formatHour } from "../lib/format.js";
import "../styles/trend.css";

export default function TrendChart({ weather }) {
  const gradientId = useId();
  const hours = weather.trendHours ?? weather.hours ?? [];
  if (hours.length < 2) return null;

  const width = 720;
  const height = 190;
  const padTop = 26;
  const padBottom = 34;

  const temps = hours.map((h) => h.temperature).filter((t) => t != null);
  if (!temps.length) return null;

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;

  const x = (index) => (index / (hours.length - 1)) * width;
  const labelX = (index) => Math.min(width - 18, Math.max(18, x(index)));
  const y = (temp) =>
    padTop + (1 - (temp - min) / span) * (height - padTop - padBottom);

  const points = hours
    .map((hour, index) =>
      hour.temperature == null ? null : [x(index), y(hour.temperature)]
    )
    .filter(Boolean);

  const line = smoothPath(points);
  const area = `${line} L ${points.at(-1)[0]} ${height - padBottom} L ${points[0][0]} ${height - padBottom} Z`;

  const warmest = hours.reduce(
    (best, hour, index) =>
      hour.temperature != null && hour.temperature > (best.value ?? -Infinity)
        ? { value: hour.temperature, index }
        : best,
    { value: null, index: 0 }
  );
  const coldest = hours.reduce(
    (best, hour, index) =>
      hour.temperature != null && hour.temperature < (best.value ?? Infinity)
        ? { value: hour.temperature, index }
        : best,
    { value: null, index: 0 }
  );

  const ticks = [0, 12, 24, 36, hours.length - 1].filter(
    (index, position, list) =>
      index < hours.length && list.indexOf(index) === position
  );

  return (
    <section
      className="trend panel glass glass--refract rise"
      style={{ "--i": 2 }}
    >
      <h2 className="eyebrow">48-hour trend</h2>
      <div className="trend__scroll scroll-x">
        <svg
          className="trend__svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Temperature trend over the next 48 hours, ranging from ${degrees(
            min
          )} to ${degrees(max)}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="trend__stop-top" />
              <stop offset="100%" className="trend__stop-bottom" />
            </linearGradient>
          </defs>

          {/* Precipitation probability, behind the curve */}
          {hours.map((hour, index) => {
            const probability = hour.precipitationProbability ?? 0;
            if (probability < 5) return null;
            const barHeight =
              (probability / 100) * (height - padTop - padBottom) * 0.55;
            return (
              <rect
                key={hour.time}
                className="trend__pop"
                x={x(index) - 3}
                y={height - padBottom - barHeight}
                width="6"
                height={barHeight}
                rx="3"
              />
            );
          })}

          <path d={area} fill={`url(#${gradientId})`} className="trend__area" />
          <path d={line} className="trend__line" fill="none" />

          <circle
            cx={x(warmest.index)}
            cy={y(warmest.value)}
            r="4"
            className="trend__peak trend__peak--hot"
          />
          <text
            x={labelX(warmest.index)}
            y={y(warmest.value) - 10}
            className="trend__peak-label"
            textAnchor="middle"
          >
            {degrees(warmest.value)}
          </text>

          <circle
            cx={x(coldest.index)}
            cy={y(coldest.value)}
            r="4"
            className="trend__peak trend__peak--cold"
          />
          <text
            x={labelX(coldest.index)}
            y={y(coldest.value) + 18}
            className="trend__peak-label"
            textAnchor="middle"
          >
            {degrees(coldest.value)}
          </text>

          {ticks.map((index) => (
            <text
              key={index}
              x={x(index)}
              y={height - 10}
              className="trend__tick"
              textAnchor={
                index === 0
                  ? "start"
                  : index === hours.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {index === 0
                ? "Now"
                : formatHour(hours[index].time, weather.timezone)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

function smoothPath(points) {
  if (points.length < 2) return "";
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const midX = (x0 + x1) / 2;
    path += ` C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`;
  }
  return path;
}
