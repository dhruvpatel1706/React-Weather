import { placeLabel } from "../lib/format.js";
import "../styles/saved.css";

/** Pinned cities as glass pills. */
export default function SavedCities({ cities, activeId, onSelect, onRemove }) {
  if (!cities.length) return null;

  return (
    <section className="saved rise" style={{ "--i": 3 }} aria-label="Saved cities">
      <h2 className="eyebrow saved__title">Saved</h2>
      <ul className="saved__list scroll-x">
        {cities.map((city) => (
          <li key={city.id} className="saved__item">
            <div
              className={`saved__pill glass glass--interactive ${
                city.id === activeId ? "is-active" : ""
              }`}
            >
              <button
                type="button"
                className="saved__select"
                onClick={() => onSelect(city)}
                aria-current={city.id === activeId ? "true" : undefined}
              >
                {placeLabel(city)}
              </button>
              <button
                type="button"
                className="saved__remove"
                onClick={() => onRemove(city.id)}
                title={`Remove ${city.name}`}
                aria-label={`Remove ${city.name} from saved cities`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 7l10 10M17 7L7 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
