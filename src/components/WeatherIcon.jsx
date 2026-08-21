import { useId } from "react";
import { weatherIcon } from "../lib/weatherCodes.js";
import "../styles/icon.css";

const Defs = ({ uid }) => (
  <defs>
    <radialGradient id={`${uid}-sun`} cx="38%" cy="34%">
      <stop offset="0%" stopColor="#fffdf0" />
      <stop offset="42%" stopColor="#ffd93d" />
      <stop offset="100%" stopColor="#f9a825" />
    </radialGradient>

    <radialGradient id={`${uid}-corona`} cx="50%" cy="50%">
      <stop offset="55%" stopColor="#ffd93d" stopOpacity="0.42" />
      <stop offset="100%" stopColor="#ffd93d" stopOpacity="0" />
    </radialGradient>

    <linearGradient id={`${uid}-cloud`} x1="20%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="52%" stopColor="#f2f6fb" />
      <stop offset="100%" stopColor="#c9d6e6" />
    </linearGradient>

    <linearGradient
      id={`${uid}-cloud-dark`}
      x1="20%"
      y1="0%"
      x2="60%"
      y2="100%"
    >
      <stop offset="0%" stopColor="#d3dde9" />
      <stop offset="100%" stopColor="#9dadc0" />
    </linearGradient>

    <linearGradient id={`${uid}-moon`} x1="25%" y1="15%" x2="75%" y2="90%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#c8d6f0" />
    </linearGradient>

    <linearGradient id={`${uid}-rain`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.15" />
      <stop offset="55%" stopColor="#38bdf8" />
      <stop offset="100%" stopColor="#0ea5e9" />
    </linearGradient>

    <linearGradient id={`${uid}-bolt`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#fff9c4" />
      <stop offset="45%" stopColor="#ffd93d" />
      <stop offset="100%" stopColor="#fb8c00" />
    </linearGradient>
  </defs>
);

const Sun = ({ uid, small }) => (
  <g className="wx-sun">
    {!small && <circle cx="24" cy="23" r="17" fill={`url(#${uid}-corona)`} />}
    <g className="wx-sun__rays">
      {!small &&
        Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1="24"
            y1="4.5"
            x2="24"
            y2="9.5"
            className="wx-sun__ray"
            transform={`rotate(${i * 45} 24 23)`}
          />
        ))}
    </g>
    <circle
      cx="24"
      cy="23"
      r={small ? 8 : 9.5}
      fill={`url(#${uid}-sun)`}
      className="wx-sun__core"
    />
    {/* Specular kiss on the upper-left of the disc. */}
    <ellipse
      cx="20.5"
      cy="19.5"
      rx="3.2"
      ry="2.4"
      fill="#fffef5"
      opacity="0.55"
    />
  </g>
);

const MOON_PATH = "M30.5 11a12.5 12.5 0 1 0 8.2 19.4A13.8 13.8 0 0 1 30.5 11Z";

const Moon = ({ uid }) => (
  <g className="wx-moon">
    <defs>
      <clipPath id={`${uid}-moon-clip`}>
        <path d={MOON_PATH} />
      </clipPath>
    </defs>
    <circle cx="27" cy="23" r="15" fill={`url(#${uid}-corona)`} opacity="0.5" />
    <path d={MOON_PATH} fill={`url(#${uid}-moon)`} />
    <g clipPath={`url(#${uid}-moon-clip)`}>
      <circle cx="28.5" cy="20" r="1.8" fill="#b9c8e4" opacity="0.45" />
      <circle cx="26" cy="27" r="1.2" fill="#b9c8e4" opacity="0.38" />
      <circle cx="31" cy="29.5" r="0.9" fill="#b9c8e4" opacity="0.3" />
    </g>
  </g>
);

const Cloud = ({ uid, dark = false, offset = 0, opacity = 1, scale = 1 }) => (
  <g
    className="wx-cloud"
    opacity={opacity}
    transform={`translate(24 ${34 + offset}) scale(${scale}) translate(-24 -34)`}
  >
    <path
      d="M16.5 42a8.8 8.8 0 0 1-.7-17.6 11.9 11.9 0 0 1 22.9 3.5 7.6 7.6 0 0 1-1.4 14.1Z"
      fill={dark ? `url(#${uid}-cloud-dark)` : `url(#${uid}-cloud)`}
    />
    <path
      d="M16.5 42h20.8a7.6 7.6 0 0 0 2.3-.4 7.6 7.6 0 0 1-2.3.4Z"
      fill="#9dadc0"
      opacity="0.5"
    />
    <ellipse cx="20" cy="28.5" rx="5.2" ry="3.4" fill="#ffffff" opacity="0.6" />
  </g>
);

const Rain = ({ uid, count = 3, heavy = false }) => (
  <g>
    {Array.from({ length: count }, (_, i) => (
      <line
        key={i}
        className="wx-drop"
        x1={16 + i * (count > 3 ? 5.5 : 7)}
        y1="44"
        x2={13.6 + i * (count > 3 ? 5.5 : 7)}
        y2={heavy ? 52 : 50}
        stroke={`url(#${uid}-rain)`}
        strokeWidth={heavy ? 2.8 : 2.4}
        style={{ animationDelay: `${i * 0.18}s` }}
      />
    ))}
  </g>
);

const Snow = ({ count = 3 }) => (
  <g>
    {Array.from({ length: count }, (_, i) => (
      <g
        key={i}
        className="wx-flake"
        style={{ animationDelay: `${i * 0.36}s` }}
        transform={`translate(${16 + i * 7} 47)`}
      >
        <circle r="2.4" fill="#ffffff" />
        <circle r="1.1" fill="#dbeafe" />
      </g>
    ))}
  </g>
);

const Bolt = ({ uid }) => (
  <path
    className="wx-bolt"
    d="M26 40.5 20.5 51h4.6l-1.8 6.5 7.2-11h-4.6l2.1-6Z"
    fill={`url(#${uid}-bolt)`}
  />
);

const Fog = () => (
  <g>
    {[0, 1, 2].map((i) => (
      <line
        key={i}
        className="wx-fog"
        x1={10 + (i % 2) * 3}
        y1={44 + i * 4.5}
        x2={38 - (i % 2) * 3}
        y2={44 + i * 4.5}
        style={{ animationDelay: `${i * 0.45}s` }}
      />
    ))}
  </g>
);

const SHAPES = {
  clear: ({ uid, isDay }) => (isDay ? <Sun uid={uid} /> : <Moon uid={uid} />),

  "mostly-clear": ({ uid, isDay }) => (
    <>
      <g transform="translate(8 -7) scale(0.78)">
        {isDay ? <Sun uid={uid} /> : <Moon uid={uid} />}
      </g>
      <Cloud uid={uid} offset={3} scale={0.92} />
    </>
  ),

  "partly-cloudy": ({ uid, isDay }) => (
    <>
      <g transform="translate(9 -8) scale(0.72)">
        {isDay ? <Sun uid={uid} /> : <Moon uid={uid} />}
      </g>
      <Cloud uid={uid} offset={4} />
    </>
  ),

  cloudy: ({ uid }) => (
    <>
      <Cloud uid={uid} dark offset={-6} scale={0.82} opacity={0.75} />
      <Cloud uid={uid} offset={3} />
    </>
  ),

  fog: ({ uid }) => (
    <>
      <Cloud uid={uid} offset={-3} opacity={0.9} />
      <Fog />
    </>
  ),

  drizzle: ({ uid }) => (
    <>
      <Cloud uid={uid} />
      <Rain uid={uid} count={3} />
    </>
  ),

  rain: ({ uid }) => (
    <>
      <Cloud uid={uid} />
      <Rain uid={uid} count={3} heavy />
    </>
  ),

  showers: ({ uid }) => (
    <>
      <Cloud uid={uid} />
      <Rain uid={uid} count={4} heavy />
    </>
  ),

  sleet: ({ uid }) => (
    <>
      <Cloud uid={uid} />
      <Rain uid={uid} count={2} />
      <g transform="translate(11 0)">
        <Snow count={2} />
      </g>
    </>
  ),

  snow: ({ uid }) => (
    <>
      <Cloud uid={uid} />
      <Snow count={3} />
    </>
  ),

  thunder: ({ uid }) => (
    <>
      <Cloud uid={uid} dark />
      <Bolt uid={uid} />
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
  const uid = useId().replace(/:/g, "");
  const key = weatherIcon(code);
  const Shape = SHAPES[key] ?? SHAPES.cloudy;

  return (
    <svg
      className={`wx ${className}`}
      viewBox="0 0 48 60"
      width={size}
      height={size * (60 / 48)}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <Defs uid={uid} />
      <Shape uid={uid} isDay={isDay} />
    </svg>
  );
}
