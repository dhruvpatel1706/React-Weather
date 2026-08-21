import { useGlassPointer } from "../hooks/useGlassPointer.js";
import "../styles/astro.css";

const LABELS = {
  alder: "Alder",
  birch: "Birch",
  grass: "Grass",
  mugwort: "Mugwort",
  olive: "Olive",
  ragweed: "Ragweed",
};

function band(value) {
  if (value < 10) return { label: "Low", level: "low" };
  if (value < 50) return { label: "Moderate", level: "moderate" };
  if (value < 500) return { label: "High", level: "high" };
  return { label: "Very High", level: "very-high" };
}

export default function PollenTile({ weather }) {
  const ref = useGlassPointer();
  const pollen = weather.air?.pollen ?? [];
  const present = pollen.filter((entry) => entry.value > 0);
  if (!present.length) return null;

  const sorted = [...present].sort((a, b) => b.value - a.value).slice(0, 4);
  const worst = band(sorted[0].value);

  return (
    <article
      ref={ref}
      className="tile tile--wide glass glass--refract glass--interactive glass--tilt rise"
      style={{ "--i": 14 }}
    >
      <h3 className="eyebrow tile__title">Pollen</h3>
      <p className="tile__value tile__value--sm">{worst.label}</p>
      <ul className="pollen">
        {sorted.map((entry) => {
          const level = band(entry.value);
          return (
            <li key={entry.key} className="pollen__row">
              <span className="pollen__name">
                {LABELS[entry.key] ?? entry.key}
              </span>
              <span className="meter pollen__meter">
                <span
                  className={`meter__fill meter__fill--${level.level}`}
                  style={{
                    width: `${Math.min(100, (entry.value / 200) * 100)}%`,
                  }}
                />
              </span>
              <span className="pollen__value">{Math.round(entry.value)}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
