import { useGlassPointer } from "../hooks/useGlassPointer.js";
import { moonPhase, formatDuration, daylightDelta } from "../lib/astronomy.js";
import { parseLocalIso } from "../lib/format.js";
import "../styles/astro.css";

export default function AstroTiles({ weather }) {
  const moonRef = useGlassPointer();
  const dayRef = useGlassPointer();
  const today = weather.days?.[0];
  const { yesterday } = weather;

  const date = weather.current?.time
    ? parseLocalIso(weather.current.time)
    : new Date();
  const moon = moonPhase(date);
  const delta = daylightDelta(
    today?.daylightSeconds,
    yesterday?.daylightSeconds
  );

  return (
    <>
      <article
        ref={moonRef}
        className="tile glass glass--refract glass--interactive glass--tilt rise"
        style={{ "--i": 12 }}
      >
        <h3 className="eyebrow tile__title">Moon</h3>
        <p className="tile__value tile__value--sm">{moon.name}</p>
        <MoonGlyph phase={moon.phase} />
        <p className="tile__note">
          {Math.round(moon.illumination * 100)}% illuminated
        </p>
      </article>

      <article
        ref={dayRef}
        className="tile glass glass--refract glass--interactive glass--tilt rise"
        style={{ "--i": 13 }}
      >
        <h3 className="eyebrow tile__title">Daylight</h3>
        <p className="tile__value">{formatDuration(today?.daylightSeconds)}</p>
        <p className="tile__note">
          {delta == null
            ? "Length of today"
            : delta === 0
              ? "Same as yesterday"
              : `${Math.abs(delta)} min ${delta > 0 ? "longer" : "shorter"} than yesterday`}
        </p>
      </article>
    </>
  );
}

function MoonGlyph({ phase }) {
  const r = 22;
  const waxing = phase < 0.5;
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;

  const outerSweep = waxing ? 1 : 0;
  const innerSweep = k > 0 ? (waxing ? 0 : 1) : waxing ? 1 : 0;

  const shadow = `M 24 2
    A ${r} ${r} 0 0 ${outerSweep} 24 46
    A ${rx} ${r} 0 0 ${innerSweep} 24 2 Z`;

  return (
    <svg className="moon" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r={r} className="moon__lit" />
      <path d={shadow} className="moon__dark" />
      <circle cx="24" cy="24" r={r} className="moon__rim" />
    </svg>
  );
}
