import { useEffect, useId, useRef, useState } from "react";
import { searchCities } from "../lib/api.js";
import { useDebounce } from "../hooks/useDebounce.js";
import "../styles/search.css";

export default function SearchBar({ onSelect, onLocate, locating }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const debounced = useDebounce(term, 300);
  const listId = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    const query = debounced.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setSearching(true);

    searchCities(query, { signal: controller.signal })
      .then((places) => {
        setResults(places);
        setActive(places.length ? 0 : -1);
        setOpen(true);
        setError(places.length ? null : "No matching places.");
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setResults([]);
        setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });

    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (place) => {
    onSelect(place);
    setTerm("");
    setResults([]);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || !results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <div className="search" ref={rootRef}>
      <div className="search__field">
        <SearchGlyph />
        <input
          type="search"
          className="search__input"
          placeholder="Search for a city…"
          aria-label="Search for a city"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 && results[active] ? `${listId}-${active}` : undefined
          }
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {searching && <span className="search__spinner" aria-hidden="true" />}
        <button
          type="button"
          className="search__locate"
          onClick={onLocate}
          disabled={locating}
          title="Use my location"
          aria-label="Use my location"
        >
          {locating ? (
            <span className="search__spinner" aria-hidden="true" />
          ) : (
            <LocationGlyph />
          )}
        </button>
      </div>

      {open && (results.length > 0 || error) && (
        <ul
          className="search__results glass glass--strong"
          id={listId}
          role="listbox"
        >
          {results.map((place, index) => (
            <li key={place.id} role="presentation">
              <button
                type="button"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={`search__result ${
                  index === active ? "is-active" : ""
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(place)}
              >
                <span className="search__result-name">{place.name}</span>
                <span className="search__result-meta">
                  {[place.admin, place.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
          {!results.length && error && (
            <li className="search__empty" role="presentation">
              {error}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" className="search__glyph" aria-hidden="true">
    <circle
      cx="11"
      cy="11"
      r="6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="16"
      y1="16"
      x2="21"
      y2="21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LocationGlyph = () => (
  <svg viewBox="0 0 24 24" className="search__glyph" aria-hidden="true">
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);
