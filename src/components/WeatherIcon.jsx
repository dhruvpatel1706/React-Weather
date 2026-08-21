import { weatherIcon } from "../lib/weatherCodes.js";
import "../styles/icon.css";

/**
 * Self-contained animated SVG weather icons.
 * The original app pulled an icon font off a CDN; these ship with the bundle
 * instead, so the app renders correctly offline and has no third-party request.
 */

const Sun = ({ small }) => (
  <g className="wx-sun">
    <circle cx="24" cy="24" r={small ? 8 : 9} className="wx-sun__core" />
    {!small &&
      Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="24"
          y1="7"
          x2="24"
          y2="12"
          className="wx-sun__ray"
          transform={`rotate(${i * 45} 24 24)`}
        />
      ))}
  </g>
);

const Moon = () => (
  <path
    className="wx-moon"
    d="M30 14a12 12 0 1 0 8.5 18.9A13.5 13.5 0 0 1 30 14Z"
  />
);

const Cloud = ({ className = "wx-cloud", offset = 0 }) => (
  <path
    className={className}
    transform={`translate(0 ${offset})`}
    d="M17.5 36a8.5 8.5 0 0 1-.6-17A11.5 11.5 0 0 1 39 22.4a7.3 7.3 0 0 1-1.3 13.6Z"
  />
);

const Drops = ({ count = 3, className = "wx-drop" }) => (
  <g>
    {Array.from({ length: count }, (_, i) => (
      <line
        key={i}
        className={className}
        x1={17 + i * 7}
        y1="38"
        x2={14.5 + i * 7}
        y2="44"
        style={{ animationDelay: `${i * 0.22}s` }}
      />
    ))}
  </g>
);

const Flakes = ({ count = 3 }) => (
  <g>
    {Array.from({ length: count }, (_, i) => (
      <circle
        key={i}
        className="wx-flake"
        cx={17 + i * 7}
        cy="40"
        r="1.8"
        style={{ animationDelay: `${i * 0.3}s` }}
      />
    ))}
  </g>
);

const Bolt = () => (
  <path className="wx-bolt" d="M25.5 36 21 45h4l-1.5 6 6.5-9.5h-4l2-5.5Z" />
);

const SHAPES = {
  clear: ({ isDay }) => (isDay ? <Sun /> : <Moon />),
  "mostly-clear": ({ isDay }) => (
    <>
      {isDay ? (
        <g transform="translate(6 -5) scale(0.72)">
          <Sun small />
        </g>
      ) : (
        <g transform="translate(8 -6) scale(0.66)">
          <Moon />
        </g>
      )}
      <Cloud offset={4} />
    </>
  ),
  "partly-cloudy": ({ isDay }) => (
    <>
      {isDay ? (
        <g transform="translate(7 -6) scale(0.7)">
          <Sun small />
        </g>
      ) : (
        <g transform="translate(9 -7) scale(0.64)">
          <Moon />
        </g>
      )}
      <Cloud offset={5} />
    </>
  ),
  cloudy: () => (
    <>
      <Cloud className="wx-cloud wx-cloud--back" offset={-4} />
      <Cloud offset={4} />
    </>
  ),
  fog: () => (
    <>
      <Cloud offset={-2} />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          className="wx-fog"
          x1={11}
          y1={39 + i * 4}
          x2={37}
          y2={39 + i * 4}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </>
  ),
  drizzle: () => (
    <>
      <Cloud />
      <Drops count={3} className="wx-drop wx-drop--light" />
    </>
  ),
  rain: () => (
    <>
      <Cloud />
      <Drops count={3} />
    </>
  ),
  showers: () => (
    <>
      <Cloud />
      <Drops count={4} />
    </>
  ),
  sleet: () => (
    <>
      <Cloud />
      <Drops count={2} />
      <Flakes count={2} />
    </>
  ),
  snow: () => (
    <>
      <Cloud />
      <Flakes count={3} />
    </>
  ),
  thunder: () => (
    <>
      <Cloud />
      <Bolt />
    </>
  ),
};

export default function WeatherIcon({
  code,
  isDay = true,
  size = 48,
  className = "",
  title,
}) {
  const key = weatherIcon(code);
  const Shape = SHAPES[key] ?? SHAPES.cloudy;

  return (
    <svg
      className={`wx ${className}`}
      viewBox="0 0 48 54"
      width={size}
      height={size * (54 / 48)}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <Shape isDay={isDay} />
    </svg>
  );
}
