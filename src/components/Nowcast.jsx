import { buildNowcast } from "../lib/nowcast.js";
import { formatHour } from "../lib/format.js";
import "../styles/nowcast.css";

/**
 * Minute-scale precipitation nowcast — the feature Dark Sky was loved for.
 * Renders a 12-hour bar chart of 15-minute precipitation buckets under a
 * plain-language headline.
 */
export default function Nowcast({ weather }) {
  const nowcast = buildNowcast(weather);
  if (!nowcast?.hasData) return null;

  const { headline, detail, active, buckets } = nowcast;
  const peak = Math.max(0.6, ...buckets.map((b) => b.precipitation ?? 0));
  const marks = [0, 12, 24, 36].filter((i) => i < buckets.length);

  return (
    <section
      className={`nowcast panel glass glass--refract rise ${active ? "is-active" : ""}`}
      style={{ "--i": 1 }}
      aria-label="Precipitation nowcast"
    >
      <div className="nowcast__head">
        <h2 className="eyebrow">Precipitation · next 12 hours</h2>
        <p className="nowcast__headline">{headline}</p>
        <p className="nowcast__detail">{detail}</p>
      </div>

      <div className="nowcast__chart" aria-hidden="true">
        {buckets.map((bucket) => (
          <span
            key={bucket.time}
            className="nowcast__bar"
            style={{
              height: `${Math.max(5, ((bucket.precipitation ?? 0) / peak) * 100)}%`,
              opacity: (bucket.precipitation ?? 0) > 0 ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <div className="nowcast__axis" aria-hidden="true">
        {marks.map((index) => (
          <span key={index}>
            {index === 0 ? "Now" : formatHour(buckets[index].time, weather.timezone)}
          </span>
        ))}
      </div>
    </section>
  );
}
