import { useState } from "react";
import { urlForPlace } from "../lib/url.js";
import "../styles/toolbar.css";

export default function Toolbar({
  units,
  onUnitsChange,
  place,
  theme,
  onThemeChange,
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (!place) return;
    const url = urlForPlace(place);
    const title = `Weather in ${place.name}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="toolbar">
      <div
        className="toolbar__units glass"
        role="group"
        aria-label="Temperature units"
      >
        <button
          type="button"
          className={units === "metric" ? "is-on" : ""}
          onClick={() => onUnitsChange("metric")}
          aria-pressed={units === "metric"}
        >
          °C
        </button>
        <button
          type="button"
          className={units === "imperial" ? "is-on" : ""}
          onClick={() => onUnitsChange("imperial")}
          aria-pressed={units === "imperial"}
        >
          °F
        </button>
      </div>

      <button
        type="button"
        className="icon-btn glass glass--interactive"
        onClick={onThemeChange}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? <SunGlyph /> : <MoonGlyph />}
      </button>

      <button
        type="button"
        className="icon-btn glass glass--interactive"
        onClick={share}
        disabled={!place}
        title="Share this location"
        aria-label="Share this location"
      >
        {copied ? <CheckGlyph /> : <ShareGlyph />}
      </button>

      {copied && (
        <span className="toolbar__toast" role="status">
          Link copied
        </span>
      )}
    </div>
  );
}

const ShareGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3v13M12 3 8 7M12 3l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m5 13 4.5 4.5L19 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SunGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="4.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const MoonGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
  </svg>
);
