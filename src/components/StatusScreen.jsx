import "../styles/status.css";

export default function StatusScreen({
  variant = "loading",
  message,
  onRetry,
}) {
  if (variant === "loading") {
    return (
      <div className="status" role="status" aria-live="polite">
        <div className="status__orb" aria-hidden="true" />
        <p className="status__text">Reading the sky…</p>
      </div>
    );
  }

  return (
    <div className="status glass" role="alert">
      <p className="status__title">Couldn't load the weather</p>
      <p className="status__text">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="status__retry glass glass--interactive"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
